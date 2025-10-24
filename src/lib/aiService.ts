import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model: any = null;

  constructor() {
    this.initializeAI();
  }

  private initializeAI() {
    // Use a public API key or environment variable
    // For demo purposes, using a placeholder - in production, use environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
    
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }
  }

  async generateResponse(message: string, context?: Record<string, unknown>): Promise<string> {
    if (!this.model) {
      return this.getFallbackResponse(message);
    }

    try {
      const prompt = this.buildPrompt(message, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(message);
    }
  }

  private buildPrompt(message: string, context?: Record<string, unknown>): string {
    const systemContext = `
You are TrustBridge AI Assistant, a helpful AI that specializes in:
- Cardano blockchain payments and transactions
- WhatsApp-based payment guidance
- Currency conversion and exchange rates
- Security best practices for crypto payments
- Transaction troubleshooting
- Payment method explanations

Current context: ${JSON.stringify(context || {})}

User message: ${message}

Provide helpful, accurate, and concise responses. Focus on TrustBridge features and Cardano blockchain payments.
If asked about setting up payments, guide users through the WhatsApp integration process.
Always prioritize security and warn about potential scams.
`;

    return systemContext;
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('send money')) {
      return `💳 To send money via TrustBridge:
      
1. Connect your Cardano wallet
2. Enter recipient's wallet address
3. Specify amount and currency
4. Click "Send via WhatsApp"
5. Complete the transaction in WhatsApp

Need help with any of these steps?`;
    }
    
    if (lowerMessage.includes('wallet') || lowerMessage.includes('connect')) {
      return `🔗 To connect your wallet:
      
1. Click "Connect Wallet" button
2. Choose your Cardano wallet (Eternl, Nami, etc.)
3. Authorize the connection
4. Your wallet will be linked to TrustBridge

Supported wallets: Eternl, Nami, Flint, and more Cardano wallets.`;
    }
    
    if (lowerMessage.includes('fee') || lowerMessage.includes('cost')) {
      return `💰 TrustBridge Fees:

• Network Fee: ~0.5 USDC (paid to Cardano network)
• Service Fee: 0.1% of transaction amount
• No hidden charges or monthly fees
• Save up to 90% compared to traditional remittance

Much cheaper than traditional money transfer services!`;
    }
    
    if (lowerMessage.includes('safe') || lowerMessage.includes('secure')) {
      return `🔒 TrustBridge Security Features:
      
• Built on Cardano blockchain (proven security)
• Multi-signature wallet support
• Smart contract protection
• End-to-end encryption
• No storage of private keys
• Real-time fraud detection

Your funds are always under your control!`;
    }
    
    if (lowerMessage.includes('whatsapp')) {
      return `📱 WhatsApp Integration:
      
• Send payment links directly through WhatsApp
• Recipients get instant notifications
• No need to download new apps
• Works with any WhatsApp number
• Secure payment confirmation process

Making crypto payments as easy as sending a message!`;
    }

    return `🤖 Hi! I'm your TrustBridge AI Assistant. I can help you with:

• Setting up payments and transfers
• Connecting your Cardano wallet  
• Understanding fees and exchange rates
• Security best practices
• WhatsApp payment integration
• Troubleshooting issues

What would you like to know about TrustBridge?`;
  }

  async analyzeTransaction(txData: Record<string, unknown>): Promise<string> {
    if (!this.model) {
      return this.getFallbackTransactionAnalysis(txData);
    }

    try {
      const prompt = `
Analyze this Cardano transaction for TrustBridge:

Transaction Data: ${JSON.stringify(txData)}

Provide insights about:
- Transaction status and confirmation
- Fee analysis
- Security assessment
- Any potential issues or recommendations

Keep response concise and user-friendly.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Transaction analysis error:', error);
      return this.getFallbackTransactionAnalysis(txData);
    }
  }

  private getFallbackTransactionAnalysis(txData: Record<string, unknown>): string {
    const status = txData?.status || 'unknown';
    const amount = txData?.amount || 0;
    const fee = txData?.fee || 0;

    if (status === 'completed') {
      return `✅ Transaction completed successfully!

Amount: ${amount} USDC
Network Fee: ${fee} USDC
Status: Confirmed on blockchain

Your payment has been processed and is now immutable on the Cardano network.`;
    }
    
    if (status === 'pending') {
      return `⏳ Transaction is being processed...

Amount: ${amount} USDC
Expected Fee: ${fee} USDC
Status: Waiting for network confirmation

This usually takes 1-3 minutes on Cardano. You'll receive a notification when complete.`;
    }

    return `📊 Transaction Analysis:

Status: ${status}
Amount: ${amount} USDC
Fee: ${fee} USDC

Need more details? Check your transaction history or contact support.`;
  }

  async getSuggestion(userAction: string): Promise<string> {
    const suggestions = {
      'first_payment': `🎉 Welcome to TrustBridge! For your first payment:

1. Start with a small amount to test the system
2. Double-check the recipient's wallet address
3. Save frequently used contacts for faster payments
4. Keep some USDC for transaction fees

Ready to send your first crypto payment via WhatsApp?`,

      'high_amount': `💎 Large Payment Detected:

For amounts over $1000:
• Consider splitting into smaller transactions
• Verify recipient address multiple times  
• Use multi-signature for extra security
• Check current network congestion
• Keep transaction receipt

Would you like to enable additional security features?`,

      'frequent_recipient': `🔄 Frequent Recipient Detected:

Since you send to this address often:
• Save as a trusted contact
• Set up recurring payments (coming soon)
• Enable instant send for this contact
• Consider batch payments for efficiency

Want to add them to your contacts?`,

      'new_country': `🌍 New International Payment:

Sending to a new country? Here are some tips:
• Check local regulations and limits
• Verify exchange rates
• Consider recipient's local wallet options
• Account for time zone differences
• Save country-specific payment notes

Need help with international payments?`
    };

    return suggestions[userAction as keyof typeof suggestions] || 
           `💡 Here's a helpful tip: Always double-check wallet addresses before sending payments!`;
  }
}

export const aiService = new AIService();
export { AIService };