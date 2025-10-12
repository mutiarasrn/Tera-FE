import Head from "next/head";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft, MessageCircle, UserPlus, Send, CheckCircle } from "lucide-react";
import { useRouter } from "next/router";

export default function HowItWorks() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>How It Works - TrustBridge</title>
        <meta name="description" content="Learn how TrustBridge makes cross-border payments simple and secure" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-indigo-600">TrustBridge</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <Button
                onClick={() => router.push('/login')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sending money across borders has never been easier.
            Follow these simple steps to start your transfer.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-12 mb-20">
          {[
            {
              step: "01",
              icon: UserPlus,
              title: "Sign Up",
              description: "Create your TrustBridge account with your WhatsApp number and basic information."
            },
            {
              step: "02",
              icon: MessageCircle,
              title: "Connect WhatsApp",
              description: "Link your WhatsApp account to our secure platform for seamless messaging."
            },
            {
              step: "03",
              icon: Send,
              title: "Send Transfer",
              description: "Enter recipient details, amount, and send your transfer via WhatsApp message."
            },
            {
              step: "04",
              icon: CheckCircle,
              title: "Money Delivered",
              description: "Recipient receives instant notification and funds are delivered within minutes."
            }
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-indigo-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4">
                  {step.step}
                </div>
                <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-indigo-600" />
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-indigo-300"
                       style={{ transform: 'translateX(50%)' }} />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Detailed Process */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            The Complete Process
          </h2>
          <div className="space-y-8">
            {[
              {
                title: "Account Setup",
                description: "Verify your identity with government-issued ID and connect your bank account or digital wallet for funding transfers."
              },
              {
                title: "WhatsApp Integration",
                description: "Our secure API connects to WhatsApp without compromising your privacy. We only access transfer-related messages."
              },
              {
                title: "Blockchain Processing",
                description: "Your transfer is processed on the Cardano blockchain, ensuring security, transparency, and immutable transaction records."
              },
              {
                title: "Instant Notification",
                description: "Both sender and recipient receive real-time updates via WhatsApp throughout the entire transfer process."
              },
              {
                title: "Delivery & Confirmation",
                description: "Funds are delivered to the recipient's chosen method (bank account, mobile wallet, or cash pickup location)."
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Send Your First Transfer?
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of users who have simplified their cross-border payments with TrustBridge.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-lg px-10 py-4 rounded-xl"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}