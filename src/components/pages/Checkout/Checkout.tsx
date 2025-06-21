import React, { useState, ChangeEvent } from 'react';
import ReactDOM from 'react-dom';
import { Form, redirect, useNavigate, useSearchParams } from 'react-router-dom';
import '../../../sass/pages/checkout/checkout.scss';
import OrderSuccess from '../../shared/OrderSuccess';
import { Item } from '../../store/CartContextProvider';
import Summary from './Summary';

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
  paymentMethod: 'cash' | 'e-money';
  eMoneyNumber?: string;
  eMoneyPin?: string;
}

export const checkoutAction = async function ({ request }: { request: Request }) {
  const formData = await request.formData();
  const url = new URL(request.url);
  const params: Item[] = JSON.parse(url.searchParams.get('items') as string);
  
  const formDataObj = Object.fromEntries(formData) as unknown as CheckoutFormData;

  // Validate required fields
  if (!formDataObj.name || !formDataObj.email || !formDataObj.phone || 
      !formDataObj.address || !formDataObj.zipCode || !formDataObj.city || 
      !formDataObj.country || !formDataObj.paymentMethod) {
    throw new Response('All fields are required', { status: 400 });
  }

  // Validate e-money fields if payment method is e-money
  if (formDataObj.paymentMethod === 'e-money') {
    if (!formDataObj.eMoneyNumber || !formDataObj.eMoneyPin) {
      throw new Response('e-Money number and PIN are required', { status: 400 });
    }
    if (!/^\d{9}$/.test(formDataObj.eMoneyNumber)) {
      throw new Response('e-Money number must be 9 digits', { status: 400 });
    }
    if (!/^\d{4}$/.test(formDataObj.eMoneyPin)) {
      throw new Response('e-Money PIN must be 4 digits', { status: 400 });
    }
  }

  try {
    const res = await fetch('http://localhost:3000/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: params.map(item => ({ id: item.name, quantity: item.count })),
        userName: formDataObj.name,
        paymentMethod: formDataObj.paymentMethod,
        ...(formDataObj.paymentMethod === 'e-money' && {
          eMoneyNumber: formDataObj.eMoneyNumber,
          eMoneyPin: formDataObj.eMoneyPin
        })
      }),
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Order processing failed');
    }

    const data = await res.json();
    return redirect(data.url || '/order-confirmation');
  } catch (err) {
    throw new Error('Failed to process order. Please try again.');
  }
};

const Checkout: React.FC = function () {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'e-money'>('cash');

  const validateField = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let isValid = true;
    let errorMessage = '';

    switch (name) {
      case 'name':
        isValid = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(value);
        errorMessage = 'Please enter a valid name';
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        errorMessage = 'Please enter a valid email';
        break;
      case 'phone':
        isValid = /^[0-9+\-]+$/.test(value);
        errorMessage = 'Please enter a valid phone number';
        break;
      case 'address':
        isValid = /\w+/g.test(value);
        errorMessage = 'Please enter a valid address';
        break;
      case 'zipCode':
        isValid = /^\d{5}(?:[-\s]\d{4})?$/.test(value);
        errorMessage = 'Please enter a valid ZIP code';
        break;
      case 'city':
      case 'country':
        isValid = value.trim().length >= 2;
        errorMessage = `Please enter a valid ${name}`;
        break;
      case 'eMoneyNumber':
        isValid = /^\d{9}$/.test(value);
        errorMessage = 'Please enter a valid 9-digit e-Money number';
        break;
      case 'eMoneyPin':
        isValid = /^\d{4}$/.test(value);
        errorMessage = 'Please enter a valid 4-digit PIN';
        break;
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: isValid ? '' : errorMessage
    }));

    if (isValid) {
      e.target.classList.remove('invalid');
    } else {
      e.target.classList.add('invalid');
    }
  };

  const handlePaymentMethodChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value as 'cash' | 'e-money');
    // Clear e-money validation errors when switching payment methods
    if (e.target.value === 'cash') {
      setFormErrors(prev => ({
        ...prev,
        eMoneyNumber: '',
        eMoneyPin: ''
      }));
    }
  };

  if (searchParams.get('orderSuccess') === 'false') {
    throw new Error('Payment failed. Please try again.');
  }

  return (
    <div className="checkout-container">
      <button 
        type="button"
        className="back-button" 
        onClick={() => navigate(-1)}
      >
        Go Back
      </button>

      <Form method="post" className="checkout-form">
        <div className="form-section">
          <h1 className="form-title">Checkout</h1>

          <div className="form-group">
            <h2 className="section-title">Billing Details</h2>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Alexei Ward"
                  onChange={validateField}
                  required
                  className={formErrors.name ? 'invalid' : ''}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="alexei@mail.com"
                  onChange={validateField}
                  required
                  className={formErrors.email ? 'invalid' : ''}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+1 202-555-0136"
                  onChange={validateField}
                  required
                  className={formErrors.phone ? 'invalid' : ''}
                />
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              </div>
            </div>
          </div>

          <div className="form-group">
            <h2 className="section-title">Shipping Info</h2>
            <div className="form-field">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="1137 Williams Avenue"
                onChange={validateField}
                required
                className={formErrors.address ? 'invalid' : ''}
              />
              {formErrors.address && <span className="error-message">{formErrors.address}</span>}
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  placeholder="10001"
                  onChange={validateField}
                  required
                  className={formErrors.zipCode ? 'invalid' : ''}
                />
                {formErrors.zipCode && <span className="error-message">{formErrors.zipCode}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="New York"
                  onChange={validateField}
                  required
                  className={formErrors.city ? 'invalid' : ''}
                />
                {formErrors.city && <span className="error-message">{formErrors.city}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                placeholder="United States"
                onChange={validateField}
                required
                className={formErrors.country ? 'invalid' : ''}
              />
              {formErrors.country && <span className="error-message">{formErrors.country}</span>}
            </div>
          </div>

          <div className="form-group">
            <h2 className="section-title">Payment Details</h2>
            <div className="payment-method">
              <label>Payment Method</label>
              <div className="radio-group">
                <label htmlFor="cash" className={`radio-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    id="cash"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={handlePaymentMethodChange}
                    required
                  />
                  Cash on Delivery
                </label>
                <label htmlFor="e-money" className={`radio-option ${paymentMethod === 'e-money' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    id="e-money"
                    name="paymentMethod"
                    value="e-money"
                    checked={paymentMethod === 'e-money'}
                    onChange={handlePaymentMethodChange}
                    required
                  />
                  e-Money
                </label>
              </div>
            </div>

            {paymentMethod === 'e-money' && (
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="eMoneyNumber">e-Money Number</label>
                  <input
                    type="text"
                    id="eMoneyNumber"
                    name="eMoneyNumber"
                    placeholder="238521993"
                    onChange={validateField}
                    required={paymentMethod === 'e-money'}
                    className={formErrors.eMoneyNumber ? 'invalid' : ''}
                    maxLength={9}
                  />
                  {formErrors.eMoneyNumber && <span className="error-message">{formErrors.eMoneyNumber}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="eMoneyPin">e-Money PIN</label>
                  <input
                    type="password"
                    id="eMoneyPin"
                    name="eMoneyPin"
                    placeholder="6891"
                    onChange={validateField}
                    required={paymentMethod === 'e-money'}
                    className={formErrors.eMoneyPin ? 'invalid' : ''}
                    maxLength={4}
                  />
                  {formErrors.eMoneyPin && <span className="error-message">{formErrors.eMoneyPin}</span>}
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="cash-message">
                <p>Pay with cash when your order is delivered. The delivery agent will collect payment.</p>
              </div>
            )}
          </div>
        </div>

        <Summary />

        {searchParams.get('ordersuccess') && ReactDOM.createPortal(
          <OrderSuccess />,
          document.getElementById('modal-root')!
        )}
      </Form>
    </div>
  );
};

export default Checkout;