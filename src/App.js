import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { handleUserInput as processUserInput, handleSuggestionClick as processSuggestionClick, scrollToBottom as scrollChatToBottom, useScrollToBottom } from './userInputFunctions';

// Update the API base URL to match the correct endpoint in Django
const API_BASE_URL = 'http://localhost:8000/api/chatbot-data/';
// const API_BASE_URL = 'https://chatbot-backend-inw1.onrender.com/api/chatbot-data/';

function App() {
  const [username, setUsername] = useState('');
  const [isGreeted, setIsGreeted] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [slotAvailability, setSlotAvailability] = useState({});
  const [subscriptionStatus, setSubscriptionStatus] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allOrderData, setAllOrderData] = useState(null);
  
  const chatEndRef = useRef(null);

  const handleUsernameSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}?query=greet-user`, { name: username });
      setGreeting(response.data.greeting);
      setOptions(response.data.options);
      setIsGreeted(true);
      
      // Add greeting as first message
      setMessages([
        { type: 'bot', content: response.data.greeting }
      ]);
      
      // Fetch all order data
      fetchAllOrderData();
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
      console.error('Error fetching greeting:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all order data at once
  const fetchAllOrderData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}?query=order-data`);
      setAllOrderData(response.data);
    } catch (err) {
      console.error('Error fetching all order data:', err);
    }
  };

  const handleOptionSelect = async (option) => {
    setSelectedOption(option);
    setLoadingData(true);
    setError(null);
    setIsSearching(false);
    
    // Add user message
    const userMessage = { type: 'user', content: option.title };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      // If we already have all order data, use it
      if (allOrderData) {
        switch (option.title) {
          case "Current Order Status":
            setCurrentOrders(allOrderData.current_orders);
            // Add bot response
            const botMessage = { 
              type: 'bot', 
              content: "Here are your current orders:", 
              data: allOrderData.current_orders,
              dataType: 'current-orders' 
            };
            setMessages(prevMessages => [...prevMessages, botMessage]);
            break;
            
          case "Previous Order Details":
            setPreviousOrders(allOrderData.previous_orders);
            // Add bot response
            const prevOrderMessage = { 
              type: 'bot', 
              content: "Here are your previous orders:", 
              data: allOrderData.previous_orders,
              dataType: 'previous-orders' 
            };
            setMessages(prevMessages => [...prevMessages, prevOrderMessage]);
            break;
            
          case "Slot Availability":
            setSlotAvailability(allOrderData.slots);
            // Add bot response
            const slotMessage = { 
              type: 'bot', 
              content: "Here's the current slot availability:", 
              data: allOrderData.slots,
              dataType: 'slots' 
            };
            setMessages(prevMessages => [...prevMessages, slotMessage]);
            break;
            
          case "Check Subscription Status":
            setSubscriptionStatus(allOrderData.subscription);
            // Add bot response
            const subMessage = { 
              type: 'bot', 
              content: "Here's your subscription status:", 
              data: allOrderData.subscription,
              dataType: 'subscription' 
            };
            setMessages(prevMessages => [...prevMessages, subMessage]);
            break;
            
          case "Search":
            setIsSearching(true);
            // Add bot response
            const searchMessage = { 
              type: 'bot', 
              content: "What would you like to search for?",
              dataType: 'search-prompt' 
            };
            setMessages(prevMessages => [...prevMessages, searchMessage]);
            break;
            
          case "Contact Us":
            // Add bot response
            const contactMessage = { 
              type: 'bot', 
              content: "Here's how you can contact us:", 
              data: option.subOptions,
              dataType: 'contact' 
            };
            setMessages(prevMessages => [...prevMessages, contactMessage]);
            break;
            
          default:
            break;
        }
      } else {
        // Fallback to individual API calls
        switch (option.title) {          
          case "Current Order Status":
            const currentOrdersResponse = await axios.get(`${API_BASE_URL}?query=current-orders`);
            setCurrentOrders(currentOrdersResponse.data);
            // Add bot response
            const botMessage = { 
              type: 'bot', 
              content: "Here are your current orders:", 
              data: currentOrdersResponse.data,
              dataType: 'current-orders' 
            };
            setMessages(prevMessages => [...prevMessages, botMessage]);
            break;
            
          case "Previous Order Details":
            const previousOrdersResponse = await axios.get(`${API_BASE_URL}?query=previous-orders`);
            setPreviousOrders(previousOrdersResponse.data);
            // Add bot response
            const prevOrderMessage = { 
              type: 'bot', 
              content: "Here are your previous orders:", 
              data: previousOrdersResponse.data,
              dataType: 'previous-orders' 
            };
            setMessages(prevMessages => [...prevMessages, prevOrderMessage]);
            break;
            
          case "Slot Availability":
            const slotResponse = await axios.get(`${API_BASE_URL}?query=slot-availability`);
            setSlotAvailability(slotResponse.data);
            // Add bot response
            const slotMessage = { 
              type: 'bot', 
              content: "Here's the current slot availability:", 
              data: slotResponse.data,
              dataType: 'slots' 
            };
            setMessages(prevMessages => [...prevMessages, slotMessage]);
            break;
            
          case "Check Subscription Status":
            const subscriptionResponse = await axios.get(`${API_BASE_URL}?query=subscription-status`);
            setSubscriptionStatus(subscriptionResponse.data);
            // Add bot response
            const subMessage = { 
              type: 'bot', 
              content: "Here's your subscription status:", 
              data: subscriptionResponse.data,
              dataType: 'subscription' 
            };
            setMessages(prevMessages => [...prevMessages, subMessage]);
            break;
            
          case "Search":
            setIsSearching(true);
            // Add bot response
            const searchMessage = { 
              type: 'bot', 
              content: "What would you like to search for?",
              dataType: 'search-prompt' 
            };
            setMessages(prevMessages => [...prevMessages, searchMessage]);
            break;
            
          case "Contact Us":
            // Add bot response
            const contactMessage = { 
              type: 'bot', 
              content: "Here's how you can contact us:", 
              data: option.subOptions,
              dataType: 'contact' 
            };
            setMessages(prevMessages => [...prevMessages, contactMessage]);
            break;
            
          default:
            break;
        }
      }
    } catch (err) {
      console.error(`Error fetching data for ${option.title}:`, err);
      setError(`Failed to load ${option.title.toLowerCase()} data. Please try again.`);
      
      // Add error message
      const errorMessage = { 
        type: 'bot', 
        content: `I'm sorry, I couldn't retrieve the ${option.title.toLowerCase()} information. Please try again.`,
        dataType: 'error' 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoadingData(false);
      // Scroll to bottom of chat
      scrollToBottom();
    }
  };

  const handleBackToOptions = () => {
    setSelectedOption(null);
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
    setSuggestions([]);
  };

  // Handle user input from the chat input
  const handleUserInput = (e) => {
    processUserInput(e, {
      searchQuery,
      setSearchQuery,
      setMessages,
      setLoadingData,
      setSelectedOption,
      setIsSearching,
      setSuggestions,
      setSearchResults,      
      setCurrentOrders,
      setSlotAvailability,
      setPreviousOrders,
      setSubscriptionStatus,
      scrollToBottom
    });
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    processSuggestionClick(suggestion, {      
      options,
      handleOptionSelect, 
      setMessages
    });
  };
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    scrollChatToBottom(chatEndRef);
  };

  // Use custom hook to scroll when messages change
  useScrollToBottom(messages, chatEndRef);

  // Helper function to render order status with appropriate styling
  const renderOrderStatus = (status) => {
    let statusClass = '';
    
    switch (status) {
      case 'Delivered':
        statusClass = 'status-delivered';
        break;
      case 'Out for Delivery':
        statusClass = 'status-out-for-delivery';
        break;
      case 'Processing':
        statusClass = 'status-processing';
        break;
      case 'Picked Up':
        statusClass = 'status-picked-up';
        break;
      default:
        statusClass = 'status-scheduled';
    }
    
    return <span className={`order-status ${statusClass}`}>{status}</span>;
  };

  // Render message content based on type
  const renderMessageContent = (message) => {
    if (!message.data) {
      return <p className="message-text">{message.content}</p>;
    }
    
    switch (message.dataType) {
      case 'current-orders':
      case 'previous-orders':
        return (
          <div className="message-content">
            <p className="message-text">{message.content}</p>
            <div className="data-container orders-container">
              {message.data.map(order => (
                <div key={order.order_id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.order_id}</h3>
                    {renderOrderStatus(order.status)}
                  </div>
                  <div className="order-details">
                    <p><strong>Service:</strong> {order.service_type}</p>
                    <p><strong>Pickup Date:</strong> {order.pickup_date}</p>
                    <p><strong>Delivery Date:</strong> {order.delivery_date}</p>
                    <p><strong>Items:</strong></p>
                    <ul className="order-items-list">
                      {order.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                    <p className="order-total"><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="message-suggestions">
                <p>You might also be interested in:</p>
                <div className="suggestion-chips">
                  {message.suggestions.map(suggestion => (
                    <button 
                      key={suggestion.id} 
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'slots':
        return (
          <div className="message-content">
            <p className="message-text">{message.content}</p>
            <div className="data-container">
              {message.data && (message.data.today || message.data.tomorrow || message.data.this_week) ? (
                <>
                  {message.data.today && message.data.today.length > 0 && (
                    <div className="data-section">
                      <h3>Today's Slots</h3>
                      <ul className="slot-list">
                        {message.data.today.map((slot, index) => (
                          <li key={index} className={slot.available ? "slot-available" : "slot-unavailable"}>
                            {slot.time} {slot.available ? "(Available)" : "(Unavailable)"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.data.tomorrow && message.data.tomorrow.length > 0 && (
                    <div className="data-section">
                      <h3>Tomorrow's Slots</h3>
                      <ul className="slot-list">
                        {message.data.tomorrow.map((slot, index) => (
                          <li key={index} className={slot.available ? "slot-available" : "slot-unavailable"}>
                            {slot.time} {slot.available ? "(Available)" : "(Unavailable)"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.data.this_week && message.data.this_week.length > 0 && (
                    <div className="data-section">
                      <h3>This Week</h3>
                      {message.data.this_week.map((day, dayIndex) => (
                        <div key={dayIndex} className="day-slots">
                          <h4>{day.day}</h4>
                          <ul className="slot-list">
                            {day.slots && day.slots.map((slot, slotIndex) => (
                              <li key={slotIndex} className="slot-available">{slot}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="error-message">No slot availability data found. Please try again later.</p>
              )}
            </div>
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="message-suggestions">
                <p>You might also be interested in:</p>
                <div className="suggestion-chips">
                  {message.suggestions.map(suggestion => (
                    <button 
                      key={suggestion.id} 
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'subscription':
        return (
          <div className="message-content">
            <p className="message-text">{message.content}</p>
            <div className="data-container">
              {message.data.active && (
                <div className="data-section active-subscription">
                  <h3>Your Active Subscription</h3>
                  <div className="subscription-details">
                    <p><strong>Plan:</strong> {message.data.active.plan}</p>
                    <p><strong>Expires:</strong> {message.data.active.expires}</p>
                    <p><strong>Price:</strong> ${message.data.active.price.toFixed(2)}/month</p>
                    <p><strong>Auto-Renew:</strong> {message.data.active.auto_renew ? "Yes" : "No"}</p>
                    <p><strong>Includes:</strong></p>
                    <ul>
                      {message.data.active.includes.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="data-section available-plans">
                <h3>Available Plans</h3>
                <div className="plans-container">
                  {message.data.available_plans && message.data.available_plans.map((plan, index) => (
                    <div key={index} className="plan-card">
                      <h4>{plan.name}</h4>
                      <p className="plan-price">${plan.price.toFixed(2)}/month</p>
                      <ul className="plan-features">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="message-suggestions">
                <p>You might also be interested in:</p>
                <div className="suggestion-chips">
                  {message.suggestions.map(suggestion => (
                    <button 
                      key={suggestion.id} 
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'contact':
        return (
          <div className="message-content">
            <p className="message-text">{message.content}</p>
            <div className="data-container">
              {message.data.map((contact) => (
                <div key={contact.id} className="contact-card">
                  <h3>{contact.title}</h3>
                  <p>{contact.content}</p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'search-results':
        return (
          <div className="message-content">
            <p className="message-text">{message.content}</p>            
            {message.data && message.data.length > 0 ? (
              <div className="search-results chat-search-results">
                {message.data.map((result, idx) => (
                  <div 
                    key={result.id || idx} 
                    className="search-result-item" 
                    onClick={() => {
                      try {
                        handleOptionSelect(result);
                      } catch (err) {
                        console.error('Error selecting search result:', err);
                      }
                    }}
                  >
                    <h4>{result.title || 'No Title'}</h4>
                    <p>{result.description || 'Click for more details'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-results-message">No exact matches found. Try different keywords or check the suggestions below.</p>
            )}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="message-suggestions">
                <p>You might be looking for:</p>
                <div className="suggestion-chips">
                  {message.suggestions.map(suggestion => (
                    <button 
                      key={suggestion.id} 
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return <p className="message-text">{message.content}</p>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>DhobiG Laundry Service</h1>
      </header>
      <main className="App-main">
        {!isGreeted ? (
          <div className="welcome-screen">
            <h2>Welcome to DhobiG Chatbot</h2>
            <p>Please enter your name to continue:</p>
            <form onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Continue'}
              </button>
            </form>
            {error && <p className="error-message">{error}</p>}
          </div>
        ) : (
          <div className="chat-interface">
            <div className="chat-messages-container">
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`chat-message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
                  >
                    <div className="message-bubble">
                      {renderMessageContent(message)}
                    </div>
                  </div>
                ))}
                {loadingData && (
                  <div className="chat-message bot-message">
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="options-buttons">
                {options.map((option) => (
                  <button
                    key={option.id}
                    className="option-button"
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.title}
                  </button>
                ))}
              </div>
              
              <div className="chat-input-container">
                <form onSubmit={handleUserInput} className="chat-input-form">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type your question here..."
                    className="chat-input"
                    disabled={loadingData}
                    autoFocus
                  />
                  <button type="submit" className="chat-send-button" disabled={loadingData}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="App-footer">
        <p>Â© 2025 DhobiG Laundry Services</p>
      </footer>
    </div>
  );
}

export default App;
