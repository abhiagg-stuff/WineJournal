import React, { useState, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Header from './components/Header';
import WineCard from './components/WineCard';
import { mockWineData } from './constants';
import { WineEntry, ResearchedData } from './types';
import AddWineModal from './components/AddWineModal';
import ActionBar from './components/ActionBar';

type ModalState = 'closed' | 'asking' | 'loading' | 'confirming' | 'editing';

const App: React.FC = () => {
  const [wineEntries, setWineEntries] = useState<WineEntry[]>(mockWineData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [researchedData, setResearchedData] = useState<ResearchedData>({});
  const [editingWine, setEditingWine] = useState<WineEntry | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleResearch = async (wineName: string) => {
    setModalState('loading');
    setApiError(null);

    // 1. Get the API key correctly using import.meta.env
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("API Key not found. Make sure to set VITE_API_KEY in your .env.local file.");
      setApiError("API Key is missing. Please configure the application correctly.");
      setModalState('asking');
      return;
    }

    try {
       // 2. Use the correct SDK class: GoogleGenerativeAI
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 1. Define the search tool configuration
      const searchToolConfig = {
      // The legacy SDK uses the 'googleSearch' property within the config
      tools: [
      {
        googleSearch: {},
      },
    ],
  };

      const prompt = `Research the wine "${wineName}". Use Google Search to find its public rating from a reputable source like Vivino. Provide details in a single, minified JSON object. The JSON must have these keys: "name" (string, the full corrected name), "vintage" (number, use current year if not specified, 0 for non-vintage), "varietal" (string), "country" (string), "description" (string, a brief professional tasting note), "publicRating" (number, from 1 to 5, can be a float, 0 if not found), "reviewCount" (number, total number of reviews), "ratingSource" (string, the name of the website providing the rating, e.g., "Vivino"), "price" (number, the latest estimated price in USD, 0 if not found), "imageUrl" (string, a direct, publicly accessible URL to an image of the wine bottle). If a value cannot be found, use an empty string for strings or 0 for numbers.`;

      // 4. Call generateContent with just the prompt
      const result = await model.generateContent(prompt);
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
        imageUrl: data.imageUrl || 'https://i.postimg.cc/xdvXnqyP/Wine-bottle.jpg',
        publicRating: data.publicRating || 0,
        reviewCount: data.reviewCount || 0,
        ratingSource: data.ratingSource || '',
        price: data.price || 0,
      });
      setModalState('confirming');

    } catch (e) {
      console.error("API call failed or unexpected error:", e);
      setApiError("Sorry, something went wrong with the wine research. Please try again or add manually.");
      setModalState('asking');
    }
  };

  const handleAddWine = (newWineData: Omit<WineEntry, 'id' | 'dateAdded'>) => {
    const newWine: WineEntry = {
      ...newWineData,
      id: Date.now(),
      dateAdded: new Date().toISOString(),
    };
    setWineEntries(prevEntries => [newWine, ...prevEntries]);
    handleCloseModal();
  };
  
  const handleUpdateWine = (updatedWine: WineEntry) => {
    setWineEntries(prevEntries => 
      prevEntries.map(wine => 
        wine.id === updatedWine.id ? updatedWine : wine
      )
    );
    handleCloseModal();
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
    setWineEntries(prevEntries => prevEntries.filter(wine => wine.id !== id));
  };

  const filteredAndSortedWines = useMemo(() => {
    let wines = [...wineEntries];

    if (searchTerm) {
      wines = wines.filter(wine =>
        wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wine.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wine.varietal.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    wines.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

    return wines;
  }, [wineEntries, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pb-28">
        <Header />
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