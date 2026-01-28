export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Nisit Deeden System</h1>
      
      <a
        href="http://localhost:8080/auth/google" // ลิงก์ตรงไปหา Backend
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Login with Google
      </a>
    </div>
  );
}