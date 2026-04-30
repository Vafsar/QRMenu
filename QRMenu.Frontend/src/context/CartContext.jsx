import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.menuItemId === action.item.menuItemId);
      if (existing) {
        return { ...state, items: state.items.map(i =>
          i.menuItemId === action.item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )};
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.menuItemId !== action.menuItemId) };
    case 'UPDATE_QTY': {
      if (action.qty <= 0)
        return { ...state, items: state.items.filter(i => i.menuItemId !== action.menuItemId) };
      return { ...state, items: state.items.map(i =>
        i.menuItemId === action.menuItemId ? { ...i, quantity: action.qty } : i
      )};
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const total = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = state.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, total, count, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
