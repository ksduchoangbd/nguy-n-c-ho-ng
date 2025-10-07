import React from 'react';
import { DownloadIcon, ImageIcon } from './Icons';

interface GeneratedImageProps {
  imageUrl: string | null;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4 text-gray-600 dark:text-gray-400">
    <svg className="animate-spin h-10 w-10 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-lg font-semibold">AI đang kiến tạo... vui lòng chờ</p>
    <p className="text-sm text-gray-500">Quá trình này có thể mất một vài phút.</p>
  </div>
);

const Placeholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4 text-gray-500">
        <ImageIcon className="w-16 h-16" />
        <p className="text-lg font-semibold">Hình ảnh của bạn sẽ xuất hiện ở đây</p>
        <p className="text-sm text-center max-w-xs">Cung cấp dữ liệu và mô tả yêu cầu của bạn để bắt đầu quá trình sáng tạo.</p>
    </div>
);


const GeneratedImage: React.FC<GeneratedImageProps> = ({ imageUrl, isLoading }) => {
  const getDownloadFilename = () => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    return `architectural-design-${timestamp}.png`;
  };
  
  return (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-900 rounded-lg flex items-center justify-center aspect-square flex-grow transition-colors duration-300">
      {isLoading ? (
        <LoadingSpinner />
      ) : imageUrl ? (
        <div className="relative group w-full h-full">
          <img src={imageUrl} alt="Generated architecture" className="object-contain w-full h-full rounded-lg" />
          <a
            href={imageUrl}
            download={getDownloadFilename()}
            className="absolute bottom-4 right-4 bg-white/70 text-gray-900 py-2 px-4 rounded-lg flex items-center space-x-2 transition-all duration-300 backdrop-blur-sm hover:bg-sky-500 hover:text-white dark:bg-gray-900/70 dark:text-white dark:hover:bg-sky-500"
          >
            <DownloadIcon className="w-5 h-5" />
            <span>Tải xuống</span>
          </a>
        </div>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

export default GeneratedImage;