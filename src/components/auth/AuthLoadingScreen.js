// components/AuthLoadingScreen.jsx
'use client';

export default function AuthLoadingScreen({ message = 'Verifying authentication...' }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8">
        {/* Animated Logo/Spinner */}
        <div className="relative inline-flex items-center justify-center mb-6">
          {/* Outer rotating ring */}
          <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"></div>
          
          {/* Inner pulsing circle */}
          <div className="h-12 w-12 animate-pulse rounded-full bg-blue-500 opacity-75"></div>
        </div>

        {/* Loading text */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {message}
        </h2>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <span className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>

        {/* Optional: Progress bar */}
        <div className="mt-6 w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 75%;
            margin-left: 12.5%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}