import { Component } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [],
  templateUrl: './faq.html',
})
export class Faq {
  faqs: FaqItem[] = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day hassle-free return policy. Items must be unused, unwashed, and in their original packaging with all tags attached. Simply initiate a return from your orders page and we will arrange a free pickup.',
      open: true
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard delivery takes 3–5 business days. Express delivery (1–2 business days) is available at checkout for an additional fee. Free standard shipping applies to all orders above ₹500.',
      open: false
    },
    {
      question: 'Can I change or cancel my order after placing it?',
      answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, the order enters processing and cannot be changed. Contact our support team immediately if you need assistance.',
      open: false
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order ships, you will receive an email with a tracking number. You can also view real-time tracking from the "My Orders" section in your profile.',
      open: false
    },
    {
      question: 'Are the product sizes true to fit?',
      answer: 'We follow standard Indian sizing. Each product page includes a detailed size guide with measurements in centimetres. If you are between sizes, we recommend sizing up for a comfortable fit.',
      open: false
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards (Visa, Mastercard, RuPay), UPI, Net Banking, and popular wallets like Paytm and PhonePe. All transactions are secured with 256-bit SSL encryption.',
      open: false
    },
    {
      question: 'Do you offer gift wrapping?',
      answer: 'Yes! Gift wrapping is available at checkout for ₹49. You can also add a personalised message card. For bulk or corporate gifting, please contact us at gifts@nexora.com.',
      open: false
    },
    {
      question: 'How do I redeem a gift card or promo code?',
      answer: 'Enter your gift card number or promo code in the "Apply Coupon" field on the cart or checkout page. Discounts are applied instantly before payment.',
      open: false
    },
    {
      question: 'Is my personal data safe?',
      answer: 'Absolutely. We never sell your personal information to third parties. Your data is stored securely and used only to process your orders and improve your shopping experience. Read our Privacy Policy for full details.',
      open: false
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can reach us via email at support@nexora.com, call us on 1800-XXX-XXXX (Mon–Sat, 9am–6pm), or use the live chat on our Contact page. We typically respond within 2 hours.',
      open: false
    },
  ];

  toggle(faq: FaqItem) {
    faq.open = !faq.open;
  }
}
