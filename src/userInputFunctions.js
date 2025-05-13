import React, { useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://chatbot-backend-inw1.onrender.com/api';
// const API_BASE_URL = 'http://localhost:8000/api';


// User input function that processes user queries
const handleUserInput = async (e, {
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
}) => {
  e.preventDefault();
  
  if (!searchQuery.trim()) return;
  
  // Add user message
  const userMessage = { type: 'user', content: searchQuery };
  setMessages(prevMessages => [...prevMessages, userMessage]);
  
  // Clear the input
  const userInput = searchQuery;
  setSearchQuery('');
  setLoadingData(true);
  try {
    const response = await axios.get(`${API_BASE_URL}/chatbot-data/?query=${encodeURIComponent(userInput)}`);
      // Handle direct matches versus regular search results
    if (response.data && response.data.match_type === 'direct') {
      // Direct match found - update selected option and data
      const option = response.data.option;
      
      if (!option) {
        throw new Error('Invalid response: option data missing');
      }
      
      const data = response.data.data || {};
      const suggestions = response.data.suggestions || [];
      
      setSelectedOption(option);
      setIsSearching(false);
      setSuggestions(suggestions);
      
      // Set the appropriate state based on the option type
      switch (option.id) {
        case 1: // Current Order Status
          setCurrentOrders(data);
          // Add bot response
          const orderMessage = { 
            type: 'bot', 
            content: `Here are your current orders:`, 
            data: data,
            dataType: 'current-orders',
            suggestions: suggestions
          };
          setMessages(prevMessages => [...prevMessages, orderMessage]);
          break;        case 2: // Slot Availability
          // Ensure we have valid slot data
          try {
            if (data && (data.today || data.tomorrow || data.this_week)) {
              setSlotAvailability(data);
              // Add bot response
              const slotMessage = { 
                type: 'bot', 
                content: `Here's the slot availability information:`, 
                data: data,
                dataType: 'slots',
                suggestions: suggestions
              };
              setMessages(prevMessages => [...prevMessages, slotMessage]);
            } else {
              // Provide fallback slot data structure
              const fallbackData = {
                today: [],
                tomorrow: [],
                this_week: []
              };
              setSlotAvailability(fallbackData);
              // Add bot response
              const slotMessage = { 
                type: 'bot', 
                content: `I couldn't retrieve the latest slot availability. Here's what I have:`, 
                data: fallbackData,
                dataType: 'slots',
                suggestions: suggestions
              };
              setMessages(prevMessages => [...prevMessages, slotMessage]);
            }
          } catch (slotErr) {
            console.error('Error handling slot availability:', slotErr);
            const errorMessage = { 
              type: 'bot', 
              content: `I'm sorry, I couldn't retrieve the slot availability information. Please try again later.`,
              dataType: 'error' 
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
          }
          break;
          
        case 3: // Previous Order Details
          setPreviousOrders(data);
          // Add bot response
          const prevOrderMessage = { 
            type: 'bot', 
            content: `Here are your previous orders:`, 
            data: data,
            dataType: 'previous-orders',
            suggestions: suggestions
          };
          setMessages(prevMessages => [...prevMessages, prevOrderMessage]);
          break;          
        case 4: // Subscription Status
          setSubscriptionStatus(data);
          // Add bot response
          const subMessage = { 
            type: 'bot', 
            content: `Here's your subscription status:`, 
            data: data,
            dataType: 'subscription',
            suggestions: suggestions
          };
          setMessages(prevMessages => [...prevMessages, subMessage]);
          break;
          
        case 5: // Contact Us
          // For Contact Us, we use the subOptions from the option itself
          const contactMessage = { 
            type: 'bot', 
            content: `Here's how you can contact us:`, 
            data: option.subOptions || [],
            dataType: 'contact',
            suggestions: suggestions
          };
          setMessages(prevMessages => [...prevMessages, contactMessage]);
          break;
          
        default:
          // Generic response for unhandled option types
          const genericMessage = { 
            type: 'bot', 
            content: `I have information about ${option.title}:`, 
            data: data,
            dataType: 'generic',
            suggestions: suggestions
          };
          setMessages(prevMessages => [...prevMessages, genericMessage]);
          break;
      }
    } else {
      // Regular search results
      const results = Array.isArray(response.data.results) ? response.data.results : [];
      const suggestions = Array.isArray(response.data.suggestions) ? response.data.suggestions : [];
      
      setSearchResults(results);
      setSuggestions(suggestions);
      
      // Add bot response with results
      const searchResultMessage = { 
        type: 'bot', 
        content: results.length > 0 
          ? `I found ${results.length} results for "${userInput}":` 
          : `I couldn't find any results for "${userInput}". Here are some suggestions:`,
        data: results,
        dataType: 'search-results',
        suggestions: suggestions
      };
      setMessages(prevMessages => [...prevMessages, searchResultMessage]);
    }
  } catch (err) {
    console.error('Error searching:', err);
    
    // Add error message with more specific information if available
    const errorMessage = { 
      type: 'bot', 
      content: `I'm sorry, I couldn't process your query. ${err.response?.status === 404 ? 'The search service is not available right now.' : 'Please try again with different keywords.'}`,
      dataType: 'error' 
    };
    setMessages(prevMessages => [...prevMessages, errorMessage]);
    
    // Clear search-related states
    setSearchResults([]);
    setSuggestions([]); 
  } finally {
    setLoadingData(false);
    // Scroll to bottom of chat
    scrollToBottom();
  }
};

// Handle suggestion click
const handleSuggestionClick = (suggestion, { options, handleOptionSelect, setMessages }) => {
  if (!suggestion || !suggestion.id) {
    console.error('Invalid suggestion object:', suggestion);
    return;
  }
  
  // Find the option that matches this suggestion
  const option = options.find(opt => opt.id === suggestion.id || opt.id === parseInt(suggestion.id));
  if (option) {
    handleOptionSelect(option);
  } else {
    console.error(`Suggestion with ID ${suggestion.id} has no matching option`);
    // Add error message
    const errorMessage = { 
      type: 'bot', 
      content: `I'm sorry, I couldn't find information for that option.`,
      dataType: 'error' 
    };
    setMessages(prevMessages => [...prevMessages, errorMessage]);
  }
};

// Scroll to bottom of chat
const scrollToBottom = (chatEndRef) => {
  setTimeout(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
};

// Component to handle scrolling when messages change
const useScrollToBottom = (messages, chatEndRef) => {
  useEffect(() => {
    scrollToBottom(chatEndRef);
  }, [messages, chatEndRef]);
};

export {
  handleUserInput,
  handleSuggestionClick,
  scrollToBottom,
  useScrollToBottom
};
