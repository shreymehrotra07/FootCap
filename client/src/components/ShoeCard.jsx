import React from "react";
import { FiShoppingBag } from "react-icons/fi";

function ShoeCard({ shoe, onClick }) {
  return (
    <div 
      className="glass-panel"
      onClick={onClick}
      style={{
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.borderColor = 'rgba(255, 42, 95, 0.3)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 42, 95, 0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
      }}
    >
      {/* Visual Wrap */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.02)', 
        aspectRatio: '1/1', 
        overflow: 'hidden',
        position: 'relative',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <img
          src={shoe.image}
          alt={shoe.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'scale(1)';
          }}
        />
        
        {/* Glow badge for sale */}
        {shoe.discount && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#FF2A5F',
            color: '#ffffff',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '10px',
            fontWeight: '700',
            padding: '4px 8px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 0 10px rgba(255, 42, 95, 0.5)'
          }}>
            Sale
          </span>
        )}
      </div>

      {/* Details */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          color: '#71717A',
          margin: '0 0 6px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontWeight: 600
        }}>{shoe.brand}</p>
        
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '16px',
          fontWeight: 600,
          color: '#ffffff',
          margin: '0 0 12px',
          letterSpacing: '-0.01em',
          lineHeight: '1.3',
          minHeight: '42px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>{shoe.name}</h3>

        <div style={{ 
          display: 'flex', 
          alignItems: 'baseline', 
          gap: '10px',
          margin: 'auto 0 16px 0'
        }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '22px',
            fontWeight: 700,
            color: '#FF2A5F',
            textShadow: '0 0 10px rgba(255, 42, 95, 0.2)'
          }}>
            ₹{shoe.price}
          </span>
          {shoe.oldPrice && (
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              textDecoration: 'line-through',
              color: '#71717A'
            }}>
              ₹{shoe.oldPrice}
            </span>
          )}
        </div>

        <button 
          style={{
            width: '100%',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            background: 'transparent',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justify-content: center,
            gap: '8px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.background = '#FF2A5F'; 
            e.currentTarget.style.borderColor = '#FF2A5F'; 
            e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 42, 95, 0.4)';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.background = 'transparent'; 
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; 
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <FiShoppingBag /> View Details
        </button>
      </div>
    </div>
  );
}

export default ShoeCard;