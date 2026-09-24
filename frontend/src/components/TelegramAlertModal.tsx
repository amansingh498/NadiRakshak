import React, { useState } from 'react';
import { MessageSquare, Send, BellRing, Check, ShieldAlert, Sparkles, X, Languages } from 'lucide-react';

interface TelegramAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRiver: string;
}

export const TelegramAlertModal: React.FC<TelegramAlertModalProps> = ({
  isOpen,
  onClose,
  activeRiver
}) => {
  const [language, setLanguage] = useState<'HI' | 'EN'>('HI');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [simulatingIncident, setSimulatingIncident] = useState(false);

  if (!isOpen) return null;

  const alerts = {
    HI: {
      title: 'नदीरक्षक अलर्ट बॉट (Telegram / WhatsApp)',
      subtitle: 'नदी की गुणवत्ता और प्रदूषण की रीयल-टाइम सूचनाएं सीधे अपने फोन पर प्राप्त करें।',
      dailyHeader: 'दैनिक नदी स्वास्थ्य बुलेटिन',
      dailyText: `नमस्ते! आज ${activeRiver} का औसत स्वास्थ्य स्कोर 32/100 (CRITICAL) है। वजीराबाद से ओखला तक बीओडी (BOD) स्तर मानकों से अधिक है। कृपया स्नान व उपयोग से पहले सतर्क रहें।`,
      incidentHeader: '🚨 आपातकालीन प्रदूषण अलर्ट (वार्ड 14 - आईटीओ)',
      incidentText: 'नागरिक रिपोर्ट #R1082: आईटीओ पुल के पास अनधिकृत रासायनिक निर्वहन की सूचना मिली है। नगर निगम और प्रदूषण नियंत्रण बोर्ड को जांच सौंपी गई है।',
      subscribeBtn: 'अलर्ट सब्सक्राइब करें',
      subscribedMsg: 'सफलतापूर्वक सब्सक्रिप्शन सक्रिय हो गया!',
      simulateBtn: 'लाइव अलर्ट सिमुलेशन भेजें'
    },
    EN: {
      title: 'NadiRakshak Alert Bot (Telegram / WhatsApp)',
      subtitle: 'Receive real-time river water health advisories and pollution alerts on your phone.',
      dailyHeader: 'Daily River Health Bulletin',
      dailyText: `Namaste! Today's average health score for ${activeRiver} is 32/100 (CRITICAL). Biochemical Oxygen Demand (BOD) exceeds CPCB Class B thresholds. Exercise caution before contact.`,
      incidentHeader: '🚨 Emergency Pollution Alert (Ward 14 - ITO)',
      incidentText: 'Citizen Incident #R1082: Heavy untreated chemical foam reported near ITO barrage. DPCC enforcement team dispatched.',
      subscribeBtn: 'Subscribe for Alerts',
      subscribedMsg: 'Alert Subscription Active!',
      simulateBtn: 'Simulate Live Alert Broadcast'
    }
  };

  const current = alerts[language];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card-panel" style={{
        maxWidth: '560px',
        width: '100%',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                {current.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {current.subtitle}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setLanguage(language === 'HI' ? 'EN' : 'HI')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#1e293b',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Languages size={14} /> {language === 'HI' ? 'हिंदी' : 'English'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Telegram Simulated Chat Box */}
        <div style={{
          background: '#090d16',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Bot Message 1 */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px 12px 12px 2px',
            padding: '12px 14px',
            border: '1px solid #334155',
            maxWidth: '90%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
              <BellRing size={14} /> {current.dailyHeader}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.4 }}>
              {current.dailyText}
            </p>
            <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '6px', textAlign: 'right' }}>
              08:00 AM • Automated Dispatch
            </span>
          </div>

          {/* Bot Message 2 (Simulated Alert) */}
          {simulatingIncident && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px 12px 12px 2px',
              padding: '12px 14px',
              border: '1px solid #ef444455',
              maxWidth: '90%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '0.75rem', fontWeight: 700 }}>
                <ShieldAlert size={14} /> {current.incidentHeader}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '6px', lineHeight: 1.4 }}>
                {current.incidentText}
              </p>
              <span style={{ fontSize: '0.65rem', color: '#ef4444aa', display: 'block', marginTop: '6px', textAlign: 'right' }}>
                Just now • Priority 1 Broadcast
              </span>
            </div>
          )}
        </div>

        {/* Interactive Subscription Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="+91 98765 43210 (Telegram / WhatsApp)"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="input-field"
              style={{ flex: 1, fontSize: '0.85rem', padding: '10px 14px' }}
            />
            <button
              onClick={() => setSubscribed(true)}
              disabled={subscribed}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: subscribed ? '#10b981' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              {subscribed ? <><Check size={16} /> Subscribed</> : <><Send size={16} /> {current.subscribeBtn}</>}
            </button>
          </div>

          <button
            onClick={() => setSimulatingIncident(!simulatingIncident)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: '#1e293b',
              border: '1px dashed #38bdf8',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={14} /> {simulatingIncident ? 'Reset Alert Feed' : current.simulateBtn}
          </button>
        </div>

      </div>
    </div>
  );
};
