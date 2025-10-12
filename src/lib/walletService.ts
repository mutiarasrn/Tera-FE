export interface WalletContact {
  walletId: string;
  whatsappNumber: string;
  name?: string;
  verified: boolean;
}

export class WalletService {
  private static walletContacts: Map<string, WalletContact> = new Map([
    ['addr1qxy2...4d7f8', { walletId: 'addr1qxy2...4d7f8', whatsappNumber: '+1234567890', name: 'John Doe', verified: true }],
    ['addr1qab3...9k2m1', { walletId: 'addr1qab3...9k2m1', whatsappNumber: '+9876543210', name: 'Jane Smith', verified: true }],
  ]);

  static validateWalletId(walletId: string): boolean {
    const cardanoAddressRegex = /^addr1[a-z0-9]{58}$/;
    return cardanoAddressRegex.test(walletId);
  }

  static findContactByWalletId(walletId: string): WalletContact | null {
    return this.walletContacts.get(walletId) || null;
  }

  static addWalletContact(contact: WalletContact): void {
    this.walletContacts.set(contact.walletId, contact);
  }

  static generateWhatsAppLink(walletId: string, amount: string, currency: string): string {
    const contact = this.findContactByWalletId(walletId);
    
    if (!contact) {
      throw new Error('Wallet ID not found in contacts');
    }

    const message = encodeURIComponent(`Payment Request: ${amount} ${currency} to wallet ${walletId}`);
    return `https://wa.me/${contact.whatsappNumber.replace('+', '')}?text=${message}`;
  }

  static getAllContacts(): WalletContact[] {
    return Array.from(this.walletContacts.values());
  }
}