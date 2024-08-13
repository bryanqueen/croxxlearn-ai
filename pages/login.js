import { signIn } from 'next-auth/react';


const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={(e) => { e.preventDefault(); signIn('credentials', { email: e.target.email.value, password: e.target.password.value }); }}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="email" name="email" type="email" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-highlight focus:border-highlight" />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input id="password" name="password" type="password" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-highlight focus:border-highlight" />
        </div>
        <button type="submit" className="w-full bg-highlight text-white py-2 rounded-md">Login</button>
      </form>
    </div>
  </div>
);

export default Login;
