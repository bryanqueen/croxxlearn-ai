import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/Header"

export default function GetStarted() {
    const showcase = [
        {
            title: '24/7 Academic Chatbot support',
            subTitle: 'Leverage our AI-powered chatbot to assist you'
        },
        {
            title: 'Test your Knowledge on Topics',
            subTitle: 'Generate quiz on any academic topic with your preferred level of difficulty'
        },
        {
            title: 'Chat with your documents',
            subTitle: 'Upload your academic materials and get instant insights and answers'
        }
    ]
  return (
    <div className="min-h-screen bg-black text-white">

      <main className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 ">
              Get started with croxxlearn ai.
            </h1>
            <p className="text-lg md:text-xl text-gray-400">
            Leverage our advanced AI tools to enhance your academic journey
            </p>
          </div>

          <div className="space-y-6 mb-12 max-w-xl mx-auto">
            {showcase.map((item, idx)=> (        
            <div key={idx} className="flex items-start gap-3">
              <div className="mt-1 bg-blue-600/20 p-1 rounded-full">
                <Check className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">
                 {item.title}
                </h3>
                <p className="text-gray-400">
                  {item.subTitle}
                </p>
              </div>
            </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <Link href="/login" className="w-full">
              <Button 
                
                className="w-full py-6 text-lg border-gray-700 hover:bg-gray-800 hover:text-white transition-colors"
              >
                Login
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button 
                className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create an account
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}