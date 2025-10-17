import React, { useState, useMemo, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Header from './components/Header';
import WineCard from './components/WineCard';
import SearchAndFilter from './components/SearchAndFilter';
import { mockWineData } from './constants';
import { WineEntry, ResearchedData, WineType, FilterOptions } from './types';
import AddWineModal from './components/AddWineModal';
import ActionBar from './components/ActionBar';


type ModalState = 'closed' | 'asking' | 'loading' | 'confirming' | 'editing';


const App: React.FC = () => {
 const [user, setUser] = useState<any>(null);
 const [authError, setAuthError] = useState<string | null>(null);
 const [showAuthModal, setShowAuthModal] = useState(false);
 const [isSignUp, setIsSignUp] = useState(false);
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [wineEntries, setWineEntries] = useState<WineEntry[]>([]);
 // Load wines from Firestore on mount
 useEffect(() => {
   // Listen for auth state changes
   const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
     setUser(firebaseUser);
   });
   return () => unsubscribe();
 }, []);
 const handleSignUp = async (e: React.FormEvent) => {
   e.preventDefault();
   setAuthError(null);


   if (password !== confirmPassword) {
     setAuthError('Passwords do not match');
     return;
   }


   try {
     await createUserWithEmailAndPassword(auth, email, password);
     setShowAuthModal(false);
     resetForm();
   } catch (error: any) {
     setAuthError(error.message || 'Sign up failed');
   }
 };


 // Login handler
 const handleLogin = async (e: React.FormEvent) => {
   e.preventDefault();
   setAuthError(null);
   try {
     await signInWithEmailAndPassword(auth, email, password);
     setShowAuthModal(false);
     resetForm();
   } catch (error: any) {
     setAuthError(error.message || 'Login failed');
   }
 };


 // Logout handler
 const handleLogout = async () => {
   await signOut(auth);
 };


 const resetForm = () => {
   setEmail('');
   setPassword('');
   setConfirmPassword('');
   setAuthError(null);
 };


 const handleGoogleSignIn = async () => {
   setAuthError(null);
   try {
     const provider = new GoogleAuthProvider();
     await signInWithPopup(auth, provider);
     setShowAuthModal(false);
     resetForm();
   } catch (error: any) {
     setAuthError(error.message || 'Google sign in failed');
   }
 };


 // Load wines from Firestore on mount
 useEffect(() => {
   const fetchWines = async () => {
     const querySnapshot = await getDocs(collection(db, "wines"));
     const wines: WineEntry[] = querySnapshot.docs.map(docSnap => {
       const data = docSnap.data();
       return {
         id: docSnap.id,
         name: data.name || '',
         vintage: data.vintage || 0,
         varietal: data.varietal || '',
         country: data.country || '',
         description: data.description || '',
         imageUrl: data.imageUrl || '',
         publicRating: data.publicRating || 0,
         reviewCount: data.reviewCount || 0,
         ratingSource: data.ratingSource || '',
         price: data.price || 0,
         rating: data.rating || 0,
         notes: data.notes || '',
         dateAdded: data.dateAdded || '',
         lastUpdated: data.lastUpdated || data.dateAdded || '',
         inCellar: data.inCellar ?? false,
         wineType: (data.wineType as WineType) || 'unknown',
       };
     });
     setWineEntries(wines);
   };
   fetchWines();
 }, []);
 const [searchTerm, setSearchTerm] = useState('');
 const [filters, setFilters] = useState<FilterOptions>({ wineType: 'all', inCellar: 'all' });
 const [modalState, setModalState] = useState<ModalState>('closed');
 const [researchedData, setResearchedData] = useState<ResearchedData>({});
 const [editingWine, setEditingWine] = useState<WineEntry | null>(null);
 const [apiError, setApiError] = useState<string | null>(null);


 const handleResearch = async (wineName: string, imageFile?: File) => {
   setModalState('loading');
   setApiError(null);


   // 1. Get the API key
   const apiKey = import.meta.env.VITE_API_KEY;
   if (!apiKey) {
     console.error("API Key not found. Make sure to set VITE_API_KEY in your .env.local file.");
     setApiError("API Key is missing. Please configure the application correctly.");
     setModalState('asking');
     return;
   }


   // 2. Process image if provided
   let imageData: { inlineData: { data: string; mimeType: string } } | null = null;
   if (imageFile) {
     try {
       const imageBase64 = await new Promise<string>((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = reject;
         reader.readAsDataURL(imageFile);
       });
       // Extract the base64 data without the data URL prefix
       const base64Data = imageBase64.split(',')[1];
       imageData = {
         inlineData: {
           data: base64Data,
           mimeType: imageFile.type
         }
       };
     } catch (error) {
       console.error('Error processing image:', error);
       setApiError('Failed to process the image. Please try again.');
       setModalState('asking');
       return;
     }
   }


   try {
     // Store the original image URL if we have one
     let capturedImageUrl = '';
     if (imageFile) {
       capturedImageUrl = URL.createObjectURL(imageFile);
     }

     // 3. Initialize Gemini with the appropriate model
     const genAI = new GoogleGenerativeAI(apiKey);
     const model = genAI.getGenerativeModel({
       model: "gemini-2.5-flash"
     });


     // 4. Prepare the prompt for either image or text analysis
     const prompt = `${imageFile ? "Analyze this wine label image" : `Research the wine${wineName ? ` "${wineName}"` : ""}`} and provide detailed information. ${
       imageFile ? "Extract all visible information from the label, then " : ""
     }use Google Search to find details and ratings from reputable sources like Vivino.
    
     Return a single, minified JSON object with these keys:
     - "name" (string): the full, correct wine name
     - "vintage" (number): the year, use current year if not specified, 0 for non-vintage
     - "varietal" (string): the grape variety or blend
     - "country" (string): country of origin
     - "description" (string): a brief, professional tasting note
     - "publicRating" (number): rating from 1-5, can be float, 0 if not found
     - "reviewCount" (number): total number of reviews
     - "ratingSource" (string): website providing the rating (e.g., "Vivino")
     - "price" (number): latest estimated price in USD, 0 if not found
     - "imageUrl" (string): direct, public URL to bottle image
     - "wineType" (string): must be exactly one of: "red", "white", "rosé", "sparkling", or "dessert". Use available information to determine the type.
    
     If any value cannot be found, use empty string for strings or 0 for numbers.`;


     // 5. Call generateContent with appropriate input
     const result = imageData
       ? await model.generateContent([prompt, imageData])
       : await model.generateContent(prompt);
     const response = result.response;


     // Log the full response for debugging
     console.log("Gemini API response:", response);


     // 5. Access the response text correctly with response.text()
     if (!response || !response.text()) {
       setApiError("No response from Gemini API. Please try again later.");
       setModalState('asking');
       return;
     }


     // 6. Get the text content
     const text = response.text();
     if (!text) {
       setApiError("No details found for this wine. Try a different name or add manually.");
       setModalState('asking');
       return;
     }


     let jsonString = text.replace(/^```json\s*/, '').replace(/```$/, '');
     let data;
     try {
       data = JSON.parse(jsonString);
     } catch (parseError) {
       console.error("Failed to parse Gemini response as JSON:", text, parseError);
       setApiError("Could not parse wine details. Try a different name or add manually.");
       setModalState('asking');
       return;
     }


     // Check for required fields
     if (!data.name || !data.description) {
       setApiError("Wine details incomplete or not found. Try a different name or add manually.");
       setModalState('asking');
       return;
     }


     setResearchedData({
       name: data.name || wineName,
       vintage: data.vintage || new Date().getFullYear(),
       varietal: data.varietal || '',
       country: data.country || '',
       description: data.description || '',
       imageUrl: imageFile ? URL.createObjectURL(imageFile) : (data.imageUrl || 'https://i.postimg.cc/xdvXnqyP/Wine-bottle.jpg'),
       publicRating: data.publicRating || 0,
       reviewCount: data.reviewCount || 0,
       ratingSource: data.ratingSource || '',
       price: data.price || 0,
         wineType: data.wineType as WineType || 'unknown',
       inCellar: false, // Default to not in cellar for new wines
     });
     setModalState('confirming');


   } catch (e) {
     console.error("API call failed or unexpected error:", e);
     setApiError("Sorry, something went wrong with the wine research. Please try again or add manually.");
     setModalState('asking');
   }
 };


 const handleAddWine = (newWineData: Omit<WineEntry, 'id' | 'dateAdded'>) => {
   const addWine = async () => {
     try {
       // If the imageUrl is a base64 string from our upload, we'll keep it
       // If it's a URL and upload failed, we'll use the default or research URL
       const imageUrl = newWineData.imageUrl?.startsWith('data:') 
         ? newWineData.imageUrl 
         : (newWineData.imageUrl || 'https://i.postimg.cc/xdvXnqyP/Wine-bottle.jpg');

       console.log('Saving wine to Firestore:', newWineData);
       const now = new Date().toISOString();
       const wineToAdd = {
         ...newWineData,
         imageUrl, // Use our processed imageUrl
         dateAdded: now,
         lastUpdated: now,
         inCellar: newWineData.inCellar ?? false,
         wineType: newWineData.wineType ?? 'unknown'
       };
       const docRef = await addDoc(collection(db, "wines"), wineToAdd);
       setWineEntries(prevEntries => [{ ...wineToAdd, id: docRef.id }, ...prevEntries]);
       handleCloseModal();
     } catch (error) {
       console.error('Error saving wine to Firestore:', error);
       setApiError('Failed to save wine. Please check your connection and Firebase setup.');
     }
   };
   addWine();
 };
  const handleUpdateWine = (updatedWine: WineEntry) => {
   const updateWine = async () => {
     const wineRef = doc(db, "wines", String(updatedWine.id));
     // Do not send 'id' field to Firestore and update the dateAdded
     const { id, ...wineData } = updatedWine;
     const updatedWineData = {
       ...wineData,
       lastUpdated: new Date().toISOString(),
       inCellar: wineData.inCellar ?? false,
       wineType: wineData.wineType ?? 'unknown'
     };
     await updateDoc(wineRef, updatedWineData);
     setWineEntries(prevEntries =>
       prevEntries.map(wine =>
         wine.id === updatedWine.id ? { ...updatedWine, dateAdded: updatedWineData.dateAdded } : wine
       )
     );
     handleCloseModal();
   };
   updateWine();
 };


 const handleStartEdit = (wine: WineEntry) => {
   setEditingWine(wine);
   setModalState('editing');
 };
  const handleCloseModal = () => {
   setModalState('closed');
   setResearchedData({});
   setEditingWine(null);
   setApiError(null);
 };


 const handleDeleteWine = (id: number) => {
   const deleteWine = async () => {
     const wineRef = doc(db, "wines", String(id));
     await deleteDoc(wineRef);
     setWineEntries(prevEntries => prevEntries.filter(wine => wine.id !== id));
   };
   deleteWine();
 };


 const filteredAndSortedWines = useMemo(() => {
   let wines = [...wineEntries];

   // Apply search filter
   if (searchTerm) {
     wines = wines.filter(wine =>
       wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       wine.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
       wine.varietal.toLowerCase().includes(searchTerm.toLowerCase())
     );
   }

   // Apply wine type filter - empty array if no types selected, otherwise filter by type
   if (filters.wineType === 'none') {
     wines = [];
   } else if (filters.wineType !== 'all') {
     wines = wines.filter(wine => wine.wineType === filters.wineType);
   }

   // Apply cellar filter
   if (filters.inCellar !== 'all') {
     wines = wines.filter(wine => wine.inCellar === filters.inCellar);
   }
  
   // Sort by date added
   wines.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

   return wines;
 }, [wineEntries, searchTerm, filters]);


 return (
   <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
     <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-28">
       <div className="pt-4 sm:pt-6 lg:pt-8">
         <Header 
           user={user}
           rightContent={
             user ? (
               <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-800 hover:underline font-medium transition-colors">Logout</button>
             ) : (
               <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900">Sign in</button>
             )
           }
         />
         <div className="mt-4">
           <div className="flex gap-2 items-center flex-wrap">
             {/* Filter Chips */}
             <SearchAndFilter
               searchTerm=""
               onSearchChange={() => {}}
               filters={filters}
               onFilterChange={setFilters}
             />
           </div>
         </div>
       </div>
     {showAuthModal && (
       <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
         <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
           <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close auth modal">✕</button>
           <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{isSignUp ? 'Sign Up' : 'Login'}</h2>
           {authError && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4 text-sm">{authError}</p>}
           <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
             <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent" />
             <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent" />
             {isSignUp && (
               <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent" />
             )}
             <button type="submit" className="w-full px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900">
               {isSignUp ? 'Sign Up' : 'Login'}
             </button>
             <div className="relative my-6 text-center">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-gray-300"></div>
               </div>
               <div className="relative flex justify-center text-sm">
                 <span className="px-2 bg-white text-gray-500">Or continue with</span>
               </div>
             </div>
             <button
               type="button"
               onClick={handleGoogleSignIn}
               className="w-full px-6 py-2 bg-[#4285f4] hover:bg-[#357ABD] text-white rounded-lg flex items-center justify-center space-x-2 relative overflow-hidden"
             >
               <div className="absolute left-1 bg-white p-2 rounded">
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                   <path
                     fill="#4285f4"
                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                   />
                   <path
                     fill="#34a853"
                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                   />
                   <path
                     fill="#fbbc05"
                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                   />
                   <path
                     fill="#ea4335"
                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                   />
                 </svg>
               </div>
               <span className="ml-8">Sign in with Google</span>
             </button>
             <div className="text-center mt-4">
               <button
                 type="button"
                 onClick={() => {
                   setIsSignUp(!isSignUp);
                   resetForm();
                 }}
                 className="text-red-800 hover:text-red-900"
               >
                 {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
               </button>
             </div>
           </form>
         </div>
       </div>
     )}
       <main className="mt-8">
         {filteredAndSortedWines.length > 0 ? (
           <div className="mt-8 grid grid-cols-1 gap-6">
             {filteredAndSortedWines.map(wine => (
               <WineCard key={wine.id} wine={wine} onDelete={handleDeleteWine} onEdit={handleStartEdit} />
             ))}
           </div>
         ) : (
           <div className="mt-16 text-center text-gray-500">
             <p className="text-xl">No wines found.</p>
             <p className="mt-2">Try adjusting your search.</p>
           </div>
         )}
       </main>
     </div>
      <ActionBar
         searchTerm={searchTerm}
         onSearchChange={setSearchTerm}
         onAddClick={() => setModalState('asking')}
       />
       <AddWineModal
         modalState={modalState}
         onClose={handleCloseModal}
         onAddWine={handleAddWine}
         onUpdateWine={handleUpdateWine}
         onResearch={handleResearch}
         researchedData={researchedData}
         editingWine={editingWine}
         apiError={apiError}
       />
   </div>
 );
};


export default App;

