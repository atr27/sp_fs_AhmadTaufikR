import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Task Management
            <span className="text-blue-600 dark:text-blue-400"> Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Organize your projects, collaborate with your team, and get things done.
            Sign up now to get started.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
            >
              Create Account
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Task Management</h3>
              <p className="text-gray-600 dark:text-gray-300">Organize your tasks with ease and keep track of your progress.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Team Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300">Work together with your team in real-time.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Anywhere Access</h3>
              <p className="text-gray-600 dark:text-gray-300">Access your tasks from any device, anytime.</p>
            </div>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
            className="inline"
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
            className="inline"
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
            className="inline"
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
