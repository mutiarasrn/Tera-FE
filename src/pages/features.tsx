import Head from "next/head";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft, MessageCircle, Zap, Shield, Globe, Smartphone, DollarSign, Clock, Users } from "lucide-react";
import { useRouter } from "next/router";

export default function Features() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <Head>
        <title>Features - TrustBridge</title>
        <meta name="description" content="Discover TrustBridge's powerful features for cross-border payments" />
      </Head>

      {/* Navigation */}
      <nav className="glass border-0 border-b border-blue-500/20 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center glow-blue">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-glow">TrustBridge</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 glass border-blue-400/30 text-blue-300 hover:text-white hover:border-blue-300/50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <Button
                onClick={() => router.push('/login')}
                className="btn-space glow-effect"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Powerful Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            TrustBridge combines cutting-edge blockchain technology with user-friendly design
            to deliver the best cross-border payment experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: MessageCircle,
              title: "WhatsApp Integration",
              description: "Send payments directly through WhatsApp messages. No need to download additional apps or create new accounts.",
              color: "bg-green-500"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Transactions complete in 2-5 minutes. Our optimized Cardano integration ensures rapid processing.",
              color: "bg-yellow-500"
            },
            {
              icon: Shield,
              title: "Military-Grade Security",
              description: "Bank-level encryption protects your funds. Built on Cardano's secure blockchain infrastructure.",
              color: "bg-purple-500"
            },
            {
              icon: Globe,
              title: "Global Reach",
              description: "Send money to 180+ countries worldwide with competitive exchange rates and low fees.",
              color: "bg-indigo-500"
            },
            {
              icon: DollarSign,
              title: "Low Fees",
              description: "Only 1.5% transfer fee - significantly lower than traditional remittance services.",
              color: "bg-green-600"
            },
            {
              icon: Smartphone,
              title: "Mobile First",
              description: "Designed for mobile use. Complete transactions entirely from your smartphone.",
              color: "bg-blue-500"
            },
            {
              icon: Clock,
              title: "24/7 Availability",
              description: "Send money anytime, anywhere. Our blockchain network never sleeps.",
              color: "bg-orange-500"
            },
            {
              icon: Users,
              title: "Multi-Language Support",
              description: "Available in multiple languages to serve our global user base effectively.",
              color: "bg-pink-500"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className={`w-16 h-16 mb-6 rounded-2xl ${feature.color} flex items-center justify-center`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-20">
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of users who trust TrustBridge for their cross-border payments.
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