import { query_transactions_wallet_transactions } from "../graphql/__generated__/query_transactions"
import { contacts_me_contacts } from "../screens/contacts-screen/__generated__/contacts"
import { AccountType, AuthenticationScreenPurpose, PinScreenPurpose } from "../utils/enum"

export type RootStackParamList = {
  getStarted: undefined
  debug: undefined
  welcomeFirst: undefined
  authenticationCheck: undefined
  authentication: {
    screenPurpose: AuthenticationScreenPurpose
    isPinEnabled: boolean
  }
  pin: { screenPurpose: PinScreenPurpose }
  Primary: undefined
  earnsSection: { section: number }
  earnsQuiz: {
    title: string
    text: string
    amount: number
    question: string
    answers: string[]
    feedback: string[]
    onComplete: () => Promise<void>
    id: string
    completed: boolean
  }
  settings: undefined
  setUsername: undefined
  language: undefined
  security: {
    mIsBiometricsEnabled: boolean
    mIsPinEnabled: boolean
  }
  sectionCompleted: { amount: number; sectionTitle: string }
  Profile: undefined
  phoneValidation: undefined
  transactionDetail: {
    currency: string | null
    tx: query_transactions_wallet_transactions
  }
  transactionHistory: undefined
  priceDetail: { account: AccountType }
  Earn: undefined
}

export type ContactStackParamList = {
  Contacts: undefined
  contactDetail: { contact: contacts_me_contacts }
  sendBitcoin: { username: string }
  transactionDetail: {
    tx: query_transactions_wallet_transactions
  }
}

export type MoveMoneyStackParamList = {
  moveMoney: undefined
  scanningQRCode: undefined
  sendBitcoin: {
    username: string | null
    payment: string | null
  }
  receiveBitcoin: undefined
  Profile: undefined
  phoneValidation: undefined
  priceDetail: { account: AccountType }
  settings: undefined
  transactionDetail: {
    tx: query_transactions_wallet_transactions
  }
}

export type PhoneValidationStackParamList = {
  welcomePhoneInput: undefined
  welcomePhoneValidation: { phone: string }
  authentication: {
    screenPurpose: AuthenticationScreenPurpose
  }
  moveMoney: undefined
}

export type PrimaryStackParamList = {
  MoveMoney: undefined
  Contacts: undefined
  Map: undefined
  Earn: undefined
  sendBitcoin: { username: string }
  phoneValidation: undefined
  earnsSection: { section: string }
}
