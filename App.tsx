import React, { useState, useCallback, useEffect } from 'react';
import type { ArchitecturalImage, ImageFile } from './types';
import { generateArchitecturalImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import GeneratedImage from './components/GeneratedImage';
import { SparklesIcon, DocumentArrowUpIcon, InformationCircleIcon, SunIcon, MoonIcon, TrashIcon } from './components/Icons';

const App: React.FC = () => {
  const [floorPlan, setFloorPlan] = useState<ImageFile | null>(null);
  const [elevation, setElevation] = useState<ImageFile | null>(null);
  const [reference, setReference] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  
  // Effect to set initial theme and manage theme changes
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleClearInputs = () => {
    setFloorPlan(null);
    setElevation(null);
    setReference(null);
    setPrompt('');
    setError(null);
    setUploaderKey(prevKey => prevKey + 1); // Force re-mount of ImageUploader components
    setShowClearConfirm(false);
  };

  const examplePrompts = [
    "Từ bản vẽ mặt bằng này, tạo render nội thất phong cách Bắc Âu, ánh sáng tự nhiên, vật liệu gỗ + trắng, view nhìn từ phòng khách hướng vào cửa sổ lớn.",
    "Cho bản vẽ mặt đứng này, tạo hình ảnh 3D isometric, giữ tỉ lệ, thêm cây xanh, vật liệu kính + bê tông.",
    "Dựa trên ảnh tham khảo, biến đổi mặt bằng này thành một không gian mở, hiện đại với tông màu đất.",
  ];

  const handleGenerate = useCallback(async () => {
    const inputImages: ArchitecturalImage[] = [
      ...(floorPlan ? [{ ...floorPlan, description: "floor plan" }] : []),
      ...(elevation ? [{ ...elevation, description: "elevation view" }] : []),
      ...(reference ? [{ ...reference, description: "style reference" }] : []),
    ];

    if (inputImages.length === 0 || !prompt) {
      setError('Vui lòng tải lên ít nhất một hình ảnh và nhập mô tả chi tiết.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateArchitecturalImage(prompt, inputImages);
      if (result) {
        setGeneratedImage(`data:image/png;base64,${result}`);
      } else {
        setError('Không thể tạo hình ảnh. Phản hồi từ AI không chứa dữ liệu hình ảnh.');
      }
    } catch (err) {
      setError(err instanceof Error ? `Đã xảy ra lỗi: ${err.message}` : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, [floorPlan, elevation, reference, prompt]);
  
  const isGenerateButtonDisabled = isLoading || (!floorPlan && !elevation && !reference) || !prompt;
  const isInputEmpty = !floorPlan && !elevation && !reference && !prompt;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      {/* Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Xác nhận Xóa</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Bạn có chắc chắn muốn xóa tất cả dữ liệu đã nhập không? Hành động này không thể được hoàn tác.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleClearInputs}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4 md:p-8">
        <header className="relative text-center mb-8 md:mb-12">
           <div className="absolute top-0 right-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <MoonIcon className="w-6 h-6" />
              ) : (
                <SunIcon className="w-6 h-6" />
              )}
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-500">
            Trợ lý Thiết kế Kiến trúc AI
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Biến bản vẽ 2D thành những hình ảnh kiến trúc đầy cảm hứng.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col space-y-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DocumentArrowUpIcon className="w-6 h-6 text-sky-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Cung cấp Dữ liệu</h2>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={isInputEmpty}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-colors"
                aria-label="Clear all inputs"
              >
                <TrashIcon className="w-4 h-4 mr-1.5" />
                Xóa tất cả
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImageUploader key={`uploader-${uploaderKey}-1`} title="Mặt bằng (2D)" onImageUpload={setFloorPlan} />
              <ImageUploader key={`uploader-${uploaderKey}-2`} title="Mặt đứng" onImageUpload={setElevation} />
              <ImageUploader key={`uploader-${uploaderKey}-3`} title="Ảnh tham khảo" onImageUpload={setReference} />
            </div>
            
            <div>
              <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-gray-900 dark:text-white">2. Mô tả Yêu cầu của bạn</label>
              <textarea
                id="prompt"
                rows={6}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 placeholder-gray-500"
                placeholder="Ví dụ: 'Tạo render nội thất phong cách tối giản với vật liệu bê tông và gỗ sồi, ánh sáng tự nhiên chan hòa...'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
             <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-semibold mb-2">Gợi ý prompt:</p>
                <ul className="space-y-2">
                  {examplePrompts.map((p, i) => (
                     <li key={i} className="flex items-start">
                        <button 
                           onClick={() => setPrompt(p)}
                           className="text-left text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors duration-200 flex items-center group"
                        >
                           <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">+</span>
                           <span>{p}</span>
                        </button>
                     </li>
                  ))}
                </ul>
              </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerateButtonDisabled}
              className={`w-full flex items-center justify-center py-3 px-6 text-lg font-bold rounded-lg transition-all duration-300 ${
                isGenerateButtonDisabled
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 to-emerald-600 text-white hover:from-sky-600 hover:to-emerald-700 shadow-lg hover:shadow-sky-500/30 transform hover:-translate-y-0.5'
              }`}
            >
              <SparklesIcon className="w-6 h-6 mr-2" />
              {isLoading ? 'Đang xử lý...' : 'Tạo hình ảnh'}
            </button>
             {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
                   <InformationCircleIcon className="w-5 h-5 mr-3"/>
                   <span>{error}</span>
                 </div>
              )}
          </div>

          {/* Output Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col border border-gray-200 dark:border-gray-700">
             <div className="flex items-center space-x-2 mb-6">
                <SparklesIcon className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kết quả</h2>
            </div>
            <GeneratedImage imageUrl={generatedImage} isLoading={isLoading} />
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Cung cấp bởi Gemini API & React</p>
      </footer>
    </div>
  );
};

export default App;