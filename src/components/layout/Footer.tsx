export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} AuralVision. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
