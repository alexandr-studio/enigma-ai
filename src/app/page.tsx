export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enigma+ Encryption
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure message encoding and decoding with custom rotor mappings 
            and advanced obfuscation features.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome to Enigma+
            </h2>
            <p className="text-gray-600 mb-6">
              This application is currently under development. 
              The encryption engine and user interface are being built.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-medium">
                🚧 Development Status: Phase 1 - Project Foundation Complete
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
