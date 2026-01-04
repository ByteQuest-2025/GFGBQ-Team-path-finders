
DRIVE VIDEO LINK OF PROJECT : https://drive.google.com/file/d/1ouCNW0t3gb3donCNvmYAtEjcgeVoBofe/view?usp=sharing

DRIVE PPT LINK OF PROJECT : https://drive.google.com/file/d/1nDhOfwaUxGHpf4Wz3r4PfbaCwM2YMfBR/view?usp=sharing






# 🏛️ AI-Driven Judicial Precedent & Case Management Ecosystem

## 🎯 Enhanced with AI Hallucination Detection & Verification System

> **Hackathon Project**: Problem Statement PS-03 - AI Hallucination Detection & Verification

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)

</div>

---

## 🌟 What's New: AI Hallucination Detection

This legal AI platform now includes a **comprehensive hallucination detection and verification system** that:

- ✅ **Detects AI Hallucinations** - Identifies fake citations, invalid statutes, and unsupported claims
- ✅ **Verifies Citations** - Cross-checks case citations against known Indian case law
- ✅ **Validates Statutes** - Confirms statute references (IPC, CPC, CrPC, Constitution)
- ✅ **Trust Scoring** - Provides 0-100% trust scores for all AI-generated content
- ✅ **Visual Indicators** - ✅ Verified, ⚠️ Partial, ❌ Unverified badges
- ✅ **Explainable AI** - Shows WHY content is verified or flagged

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Groq API key ([Get one here](https://console.groq.com))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API key:**

   Edit `.env.local` and add your Groq API key:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 🎯 Core Features

### **For Judges**
- 📊 **Explainable AI Dashboard** - Understand how AI reaches conclusions
- 🛡️ **Hallucination Detector** - Scan AI outputs for fake citations and claims
- 🔍 **Bias & Hallucination Monitor** - Detect both bias and AI fabrications
- 📈 **Judicial Analytics** - Data-driven case insights
- 🔗 **Blockchain Audit Log** - Transparent case history

### **For Advocates**
- 🔬 **AI Legal Research** - RAG-powered precedent search with verification
- 📚 **Similar Case Analyzer** - Find relevant cases with trust scoring
- ⚖️ **Argument Builder** - Generate legal arguments with verified precedents
- 📝 **AI Legal Drafts** - Generate legal documents
- 📅 **Smart Calendar** - Intelligent case scheduling

### **For Citizens**
- 📋 **Smart Case Filing** - AI-guided complaint filing
- 👨‍⚖️ **Lawyer Recommendations** - AI-matched legal representation
- 💬 **Legal Chatbot** - General legal guidance
- 📊 **Case Dashboard** - Track case progress

---

## 🔬 Hallucination Detection Features

### **1. Hallucination Detector** ([Demo](DEMO_SCENARIOS.md#scenario-1))
Paste any AI-generated legal text to:
- Extract and verify factual claims
- Detect fake case citations
- Identify invalid statute references
- Flag unsupported legal assertions
- Get detailed explanations for each finding

**Location**: Judge Dashboard → "Hallucination Detector" tab

### **2. Integrated Verification**
Automatic verification on:
- **Precedent Search** - Verifies RAG-generated answers
- **Similar Case Analyzer** - Validates case citations
- **Argument Builder** - Checks suggested precedents

### **3. Trust Scoring System**
Every AI output receives:
- **Overall Trust Score** (0-100%)
- **Per-Claim Verification** (Verified/Partial/Hallucinated)
- **Confidence Scores** (How certain is the system?)
- **Visual Badges** (Quick at-a-glance trust indicators)

### **4. Explainability Dashboard**
Complete transparency:
- See ALL extracted claims
- Click on any claim for details
- Understand verification chain
- View source attribution

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────┐
│           User Interface (React + TypeScript)        │
├─────────────────────────────────────────────────────┤
│  Components:                                         │
│  ├─ HallucinationDetector    ← New                  │
│  ├─ ExplainabilityDashboard   ← New                 │
│  ├─ TrustBadge (Reusable)     ← New                 │
│  ├─ PrecedentSearch           ✓ Enhanced            │
│  ├─ SimilarCaseAnalyzer       ✓ Enhanced            │
│  └─ ArgumentBuilder           ✓ Enhanced            │
├─────────────────────────────────────────────────────┤
│  Services:                                           │
│  ├─ verificationService.ts    ← New (371 lines)     │
│  │   ├─ extractClaims()                             │
│  │   ├─ verifyCaseCitation()                        │
│  │   ├─ verifyStatute()                             │
│  │   ├─ detectHallucinations()                      │
│  │   └─ verifyLegalText()                           │
│  └─ geminiService.ts          ✓ Enhanced            │
├─────────────────────────────────────────────────────┤
│           AI Layer (Groq - Llama 3.3 70B)            │
│  ├─ llama-3.3-70b-versatile - Primary model         │
│  └─ Ultra-fast inference with Groq LPU              │
└─────────────────────────────────────────────────────┘
```

---

## 🎬 Demo & Testing

### **Quick Demo (5 minutes)**

1. **Login** as Judge (any credentials work)
2. **Navigate** to Judge Dashboard → "Hallucination Detector"
3. **Paste test text**:
   ```
   In the case of Rajesh Kumar vs. State of Delhi (2025),
   the Supreme Court cited Article 999 and Section 498A IPC.
   ```
4. **Click** "Verify AI Output"
5. **Observe** the results:
   - Trust Score: ~50%
   - Fake case detected ("Rajesh Kumar vs. State of Delhi")
   - Invalid article detected ("Article 999")
   - Valid statute verified ("Section 498A IPC")

**For more test scenarios**, see [DEMO_SCENARIOS.md](DEMO_SCENARIOS.md)

---

## 📁 Project Structure

```
├── components/
│   ├── HallucinationDetector.tsx     ← NEW: Main detector UI
│   ├── ExplainabilityDashboard.tsx   ← NEW: Transparency interface
│   ├── TrustBadge.tsx                ← NEW: Reusable trust indicators
│   ├── PrecedentSearch.tsx           ✓ Enhanced with verification
│   ├── SimilarCaseAnalyzer.tsx       ✓ Enhanced with verification
│   ├── ArgumentBuilder.tsx           ✓ Enhanced with verification
│   └── addons/
│       └── BiasMonitor.tsx           ✓ Enhanced: Bias + Hallucinations
├── services/
│   ├── verificationService.ts        ← NEW: Core verification engine
│   ├── groqService.ts                ✓ Primary AI service (Groq/Llama 3.3)
│   └── geminiService.ts              ✓ Enhanced with hallucination detection
├── types.ts                          ✓ New verification types added

```

---

## 🔧 Technical Details

### **Verification Algorithm**

1. **Claim Extraction** (AI-powered NLP)
   - Identifies case citations
   - Extracts statute references
   - Finds factual legal claims

2. **Multi-Layer Verification**
   - **Layer 1**: Pattern matching (citation format, dates)
   - **Layer 2**: Cross-reference with known Indian statutes
   - **Layer 3**: AI-based plausibility assessment
   - **Layer 4**: Confidence scoring

3. **Trust Calculation**
   - Per-claim confidence (0.0 - 1.0)
   - Weighted average for overall score
   - Categorization: Verified (≥0.7), Partial (0.4-0.7), Hallucinated (<0.4)

### **Technologies Used**

- **Frontend**: React 19, TypeScript, Vite
- **AI/ML**: Groq (Llama 3.3 70B Versatile)
- **Inference**: Groq LPU (Language Processing Unit) for ultra-fast responses
- **Styling**: Custom CSS with theme support
- **State Management**: React Hooks
- **Type Safety**: TypeScript strict mode

---

## 🏆 Hackathon Alignment

### **Problem Statement PS-03 Requirements**

| Requirement | Implementation | Status |
|------------|----------------|--------|
| Detect AI hallucinations | Multi-type detection system | ✅ Complete |
| Verify citations | Case citation verification | ✅ Complete |
| Verify references | Statute validation | ✅ Complete |
| Flag unreliable outputs | Visual warnings + severity | ✅ Complete |
| Trust signaling | ✅⚠️❌ badges system-wide | ✅ Complete |

**For detailed alignment analysis**, see [HACKATHON_IMPLEMENTATION.md](HACKATHON_IMPLEMENTATION.md)

---

## 📚 Documentation

- **[HACKATHON_IMPLEMENTATION.md](HACKATHON_IMPLEMENTATION.md)** - Complete technical documentation
- **[DEMO_SCENARIOS.md](DEMO_SCENARIOS.md)** - Ready-to-use test cases
- **[PRESENTATION_TALKING_POINTS.md](PRESENTATION_TALKING_POINTS.md)** - Presentation guide

---

## 🎯 Key Differentiators

1. **🔄 Automatic Verification** - No manual checking required
2. **⚖️ Legal Domain Expertise** - Specialized for Indian law
3. **🔍 Multi-Layered Detection** - Not just one verification method
4. **💡 Explainable AI** - Complete transparency
5. **🎨 Inline Integration** - Verification within workflow
6. **🚀 Production-Ready** - Not just a prototype
7. **⚡ Ultra-Fast Inference** - Groq LPU for lightning-fast responses

---

## 🔮 Future Enhancements

- [ ] Integration with Indian Kanoon API for live case verification
- [ ] Fine-tuned Llama model specifically on Indian case law
- [ ] Batch verification API for large documents
- [ ] PDF verification report export
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Real-time statute database updates
- [ ] Function calling for advanced RAG workflows

---

## 🤝 Contributing

This is a hackathon project. For questions or suggestions, please open an issue.

---

## 📄 License

This project was created for educational and demonstration purposes.

---

## 🙏 Acknowledgments

- **Groq** for ultra-fast LLM inference with Llama 3.3 70B
- **Meta AI** for the Llama 3.3 model
- **React & TypeScript** communities for excellent tools
- **Hackathon Organizers** for the opportunity

---

## 📧 Contact

For demo requests or questions about the implementation, please refer to the documentation files or create an issue.

---

<div align="center">

**Built with ❤️ for AI Safety in Legal Systems**

*Making AI Trustworthy for Justice*

</div>
