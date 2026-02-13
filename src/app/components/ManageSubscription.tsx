import { ArrowLeft, CreditCard, Check, Calendar, Receipt, AlertCircle, Crown, Zap } from 'lucide-react';
import { useState } from 'react';

interface ManageSubscriptionProps {
  onBack: () => void;
}

type PlanType = 'free' | 'pro' | 'premium';

interface Plan {
  id: PlanType;
  name: string;
  price: number;
  billing: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billing: 'Forever',
    features: [
      'Track up to 5 vehicles',
      'Basic cost tracking',
      'Manual profit calculations',
      'Local data storage',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    billing: 'per month',
    popular: true,
    features: [
      'Unlimited vehicles',
      'Advanced cost tracking',
      'Automatic calculations',
      'PDF export reports',
      'Cloud backup',
      'Registration tracking',
      'Activity timeline',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 89.99,
    billing: 'per year',
    features: [
      'Everything in Pro',
      'Priority support',
      'Advanced analytics',
      'Custom categories',
      'Multi-device sync',
      'Bulk import/export',
      'API access',
      '2 months free',
    ],
  },
];

export function ManageSubscription({ onBack }: ManageSubscriptionProps) {
  const [currentPlan, setCurrentPlan] = useState<PlanType>('premium');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  // Sample data
  const subscriptionStartDate = '2026-01-01';
  const subscriptionEndDate = '2026-12-31';
  const nextBillingDate = '2027-01-01';
  const daysRemaining = Math.ceil((new Date(subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const billingHistory = [
    { id: '1', date: '2026-01-01', amount: 89.99, status: 'Paid', plan: 'Premium Annual' },
    { id: '2', date: '2025-01-01', amount: 89.99, status: 'Paid', plan: 'Premium Annual' },
    { id: '3', date: '2024-01-01', amount: 89.99, status: 'Paid', plan: 'Premium Annual' },
  ];

  const handleChangePlan = (planId: PlanType) => {
    if (planId === currentPlan) return;
    
    // In a real app, this would trigger payment flow or API call
    alert(`Plan change requested to ${planId.toUpperCase()}. This would initiate the payment/upgrade process.`);
  };

  const handleCancelSubscription = () => {
    setShowCancelConfirm(false);
    alert('Subscription cancelled. You will retain access until the end of your billing period.');
    // In a real app, this would call an API to cancel the subscription
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl">Manage Subscription</h1>
        </div>

        {/* Current Subscription Status */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Premium Plan</h2>
              </div>
              <p className="text-blue-100">Active subscription</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              daysRemaining > 30 
                ? 'bg-white/20 text-white' 
                : daysRemaining > 7
                ? 'bg-orange-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <div className="text-blue-100 text-sm mb-1">Started</div>
              <div className="font-medium">{new Date(subscriptionStartDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-blue-100 text-sm mb-1">Expires</div>
              <div className="font-medium">{new Date(subscriptionEndDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-blue-100 text-sm mb-1">Next Billing</div>
              <div className="font-medium">{new Date(nextBillingDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-blue-100 text-sm mb-1">Amount</div>
              <div className="font-medium">$89.99/year</div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-6">
          <h2 className="text-xl mb-4">Available Plans</h2>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-card rounded-2xl p-6 border-2 transition-all ${
                  currentPlan === plan.id
                    ? 'border-blue-600'
                    : 'border-border hover:border-blue-400'
                } ${plan.popular ? 'relative' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-blue-600">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {plan.billing}
                      </span>
                    </div>
                  </div>
                  {currentPlan === plan.id && (
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {currentPlan !== plan.id && (
                  <button
                    onClick={() => handleChangePlan(plan.id)}
                    className={`w-full py-3 rounded-xl transition-colors ${
                      plan.id === 'free'
                        ? 'bg-muted hover:bg-accent'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {plan.id === 'free' ? 'Downgrade' : 'Upgrade'} to {plan.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Payment Method</h2>
            <button
              onClick={() => setShowPaymentMethod(true)}
              className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
            >
              Update
            </button>
          </div>

          <div className="flex items-center gap-4 bg-muted rounded-xl p-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium mb-1">Visa ending in 4242</div>
              <div className="text-sm text-muted-foreground">Expires 12/2027</div>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <h2 className="text-xl mb-4">Billing History</h2>
          <div className="space-y-3">
            {billingHistory.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/10 p-2 rounded-lg">
                    <Receipt className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{invoice.plan}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${invoice.amount}</div>
                  <div className="text-sm text-green-600">{invoice.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Renewal */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium mb-1">Auto-Renewal</h3>
              <p className="text-sm text-muted-foreground">
                Your subscription will automatically renew on {new Date(nextBillingDate).toLocaleDateString()}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Cancel Subscription */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-500 mb-1">Cancel Subscription</h3>
              <p className="text-sm text-muted-foreground">
                You will retain access until {new Date(subscriptionEndDate).toLocaleDateString()}. After that, your account will be downgraded to the Free plan.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-colors"
          >
            Cancel Subscription
          </button>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-border">
              <h3 className="text-xl mb-3">Cancel Subscription?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to cancel your Premium subscription? You'll lose access to:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited vehicle tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Cloud backup and sync</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics and reports</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 bg-muted hover:bg-accent py-3 rounded-xl transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-colors"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Modal */}
        {showPaymentMethod && (
          <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
            <div className="bg-card rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl">Update Payment Method</h2>
                  <button 
                    onClick={() => setShowPaymentMethod(false)} 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentMethod(false)}
                      className="flex-1 bg-muted hover:bg-accent py-3 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Payment method updated successfully!');
                        setShowPaymentMethod(false);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors"
                    >
                      Update Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
