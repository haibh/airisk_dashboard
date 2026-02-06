/**
 * Comprehensive Mock Data Seed for AIRM-IP
 * Generates realistic AI systems, risk assessments, and evidence across multiple domains
 */

import {
  PrismaClient,
  AISystemType,
  DataClassification,
  LifecycleStatus,
  RiskTier,
  AssessmentStatus,
  RiskCategory,
  TreatmentStatus,
  EvidenceStatus,
  EntityType,
} from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// AI SYSTEM TEMPLATES BY DOMAIN
// ============================================================================

interface AISystemTemplate {
  name: string;
  description: string;
  systemType: AISystemType;
  dataClassification: DataClassification;
  purpose: string;
  dataInputs: string;
  dataOutputs: string;
  thirdPartyAPIs: string[];
  baseModels: string[];
  trainingDataSources: string[];
  domain: string;
}

const AI_SYSTEM_TEMPLATES: AISystemTemplate[] = [
  // BANKING & FINANCE (150 systems)
  { name: 'Credit Scoring Engine', description: 'ML-based credit risk assessment for loan applications', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Automated credit worthiness evaluation', dataInputs: 'Credit history, income, employment data', dataOutputs: 'Credit score, risk category, approval recommendation', thirdPartyAPIs: ['Experian API', 'TransUnion API'], baseModels: ['XGBoost', 'LightGBM'], trainingDataSources: ['Historical loan data', 'Credit bureau records'], domain: 'Banking' },
  { name: 'Fraud Detection System', description: 'Real-time transaction fraud detection using anomaly detection', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Identify fraudulent transactions in real-time', dataInputs: 'Transaction data, device fingerprint, location', dataOutputs: 'Fraud probability score, alert triggers', thirdPartyAPIs: ['Stripe Radar', 'Sift Science'], baseModels: ['Isolation Forest', 'Neural Network'], trainingDataSources: ['Historical fraud cases', 'Transaction patterns'], domain: 'Banking' },
  { name: 'AML Transaction Monitor', description: 'Anti-money laundering pattern detection system', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Detect suspicious money laundering activities', dataInputs: 'Wire transfers, account activity, customer profiles', dataOutputs: 'SAR recommendations, risk alerts', thirdPartyAPIs: ['OFAC API', 'World-Check'], baseModels: ['Graph Neural Networks', 'LSTM'], trainingDataSources: ['SAR filings', 'Regulatory guidance'], domain: 'Banking' },
  { name: 'Algorithmic Trading Bot', description: 'High-frequency trading algorithm for market making', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Automated securities trading and market making', dataInputs: 'Market data feeds, order books, news sentiment', dataOutputs: 'Trade orders, position adjustments', thirdPartyAPIs: ['Bloomberg API', 'Reuters Eikon'], baseModels: ['Reinforcement Learning', 'ARIMA'], trainingDataSources: ['Historical market data', 'Economic indicators'], domain: 'Finance' },
  { name: 'Customer Churn Predictor', description: 'Predicts likelihood of customer account closure', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Identify at-risk customers for retention campaigns', dataInputs: 'Account activity, customer interactions, demographics', dataOutputs: 'Churn probability, recommended interventions', thirdPartyAPIs: ['Salesforce API'], baseModels: ['Random Forest', 'Gradient Boosting'], trainingDataSources: ['Customer lifecycle data'], domain: 'Banking' },
  { name: 'Loan Default Predictor', description: 'Predicts probability of loan default', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Assess loan portfolio risk', dataInputs: 'Payment history, economic indicators, borrower data', dataOutputs: 'Default probability, expected loss', thirdPartyAPIs: ['Federal Reserve API'], baseModels: ['Logistic Regression', 'Neural Network'], trainingDataSources: ['Loan performance history'], domain: 'Banking' },
  { name: 'KYC Document Verifier', description: 'Automated identity document verification', systemType: 'GENAI', dataClassification: 'RESTRICTED', purpose: 'Verify customer identity documents', dataInputs: 'ID images, selfies, document metadata', dataOutputs: 'Verification status, fraud indicators', thirdPartyAPIs: ['Jumio API', 'Onfido'], baseModels: ['Vision Transformer', 'OCR'], trainingDataSources: ['Document samples', 'Fraud examples'], domain: 'Banking' },
  { name: 'Investment Robo-Advisor', description: 'Automated portfolio management and rebalancing', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Provide personalized investment advice', dataInputs: 'Risk tolerance, financial goals, market data', dataOutputs: 'Portfolio allocation, trade recommendations', thirdPartyAPIs: ['Morningstar API', 'Alpha Vantage'], baseModels: ['Mean-Variance Optimization', 'Monte Carlo'], trainingDataSources: ['Historical returns', 'Economic forecasts'], domain: 'Finance' },
  { name: 'Real-time Risk Calculator', description: 'Portfolio risk metrics calculation engine', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Calculate VaR, stress tests, and risk metrics', dataInputs: 'Portfolio positions, market data', dataOutputs: 'VaR, Expected Shortfall, Greeks', thirdPartyAPIs: ['Bloomberg Risk'], baseModels: ['Monte Carlo Simulation'], trainingDataSources: ['Market history'], domain: 'Finance' },
  { name: 'Mortgage Underwriting AI', description: 'Automated mortgage application processing', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Automate mortgage underwriting decisions', dataInputs: 'Application data, property info, credit reports', dataOutputs: 'Underwriting decision, conditions', thirdPartyAPIs: ['Fannie Mae DU', 'Freddie Mac LP'], baseModels: ['Decision Trees', 'Ensemble'], trainingDataSources: ['Historical mortgages'], domain: 'Banking' },

  // INSURANCE (100 systems)
  { name: 'Claims Processing Engine', description: 'Automated insurance claims adjudication', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Automate claims processing workflow', dataInputs: 'Claim forms, medical records, policy data', dataOutputs: 'Claim decision, payment amount', thirdPartyAPIs: ['Verisk API', 'LexisNexis'], baseModels: ['NLP Classifier', 'Rule Engine'], trainingDataSources: ['Historical claims'], domain: 'Insurance' },
  { name: 'Underwriting Risk Model', description: 'Insurance underwriting risk assessment', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Assess applicant risk for policy pricing', dataInputs: 'Application data, medical history, demographics', dataOutputs: 'Risk score, premium recommendation', thirdPartyAPIs: ['MIB API', 'Rx History'], baseModels: ['GLM', 'Survival Analysis'], trainingDataSources: ['Loss history data'], domain: 'Insurance' },
  { name: 'Fraud Claims Detector', description: 'Insurance fraud detection system', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Identify potentially fraudulent claims', dataInputs: 'Claim details, historical patterns, network data', dataOutputs: 'Fraud score, investigation flags', thirdPartyAPIs: ['NICB Database'], baseModels: ['Anomaly Detection', 'Network Analysis'], trainingDataSources: ['Confirmed fraud cases'], domain: 'Insurance' },
  { name: 'Telematics Risk Scorer', description: 'Usage-based insurance scoring from driving data', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Score driver behavior for UBI policies', dataInputs: 'GPS data, accelerometer, driving patterns', dataOutputs: 'Driving score, risk factors', thirdPartyAPIs: ['Cambridge Mobile Telematics'], baseModels: ['Time Series Analysis', 'Clustering'], trainingDataSources: ['Telematics data'], domain: 'Insurance' },
  { name: 'Property Damage Estimator', description: 'AI-powered property damage assessment', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL', purpose: 'Estimate repair costs from images', dataInputs: 'Damage photos, property details', dataOutputs: 'Repair estimate, damage severity', thirdPartyAPIs: ['Tractable AI'], baseModels: ['Computer Vision', 'Regression'], trainingDataSources: ['Damage assessments'], domain: 'Insurance' },
  { name: 'Catastrophe Modeling System', description: 'Natural disaster risk modeling', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Model catastrophe exposure and losses', dataInputs: 'Property data, weather data, geography', dataOutputs: 'PML estimates, exposure reports', thirdPartyAPIs: ['AIR Worldwide', 'RMS'], baseModels: ['Simulation', 'Extreme Value Theory'], trainingDataSources: ['Historical catastrophes'], domain: 'Insurance' },
  { name: 'Life Expectancy Predictor', description: 'Actuarial life expectancy modeling', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Predict life expectancy for underwriting', dataInputs: 'Health data, lifestyle, genetics', dataOutputs: 'Life expectancy, mortality risk', thirdPartyAPIs: ['CDC API'], baseModels: ['Survival Models', 'Cox Regression'], trainingDataSources: ['Mortality tables'], domain: 'Insurance' },
  { name: 'Policy Recommendation Engine', description: 'Personalized insurance product recommendations', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Recommend optimal coverage options', dataInputs: 'Customer profile, life events, existing coverage', dataOutputs: 'Product recommendations, coverage gaps', thirdPartyAPIs: ['CRM Integration'], baseModels: ['Collaborative Filtering'], trainingDataSources: ['Purchase history'], domain: 'Insurance' },

  // HEALTHCARE (150 systems)
  { name: 'Clinical Decision Support', description: 'AI-assisted diagnosis recommendations', systemType: 'GENAI', dataClassification: 'RESTRICTED', purpose: 'Support physician diagnostic decisions', dataInputs: 'Patient symptoms, medical history, lab results', dataOutputs: 'Differential diagnosis, treatment options', thirdPartyAPIs: ['EPIC FHIR', 'UpToDate'], baseModels: ['GPT-4 Medical', 'BioBERT'], trainingDataSources: ['Clinical guidelines', 'Case studies'], domain: 'Healthcare' },
  { name: 'Medical Image Analyzer', description: 'Radiology image analysis for pathology detection', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Detect abnormalities in medical imaging', dataInputs: 'X-rays, CT scans, MRIs', dataOutputs: 'Findings, probability scores', thirdPartyAPIs: ['PACS Integration'], baseModels: ['ResNet', 'U-Net'], trainingDataSources: ['Annotated imaging datasets'], domain: 'Healthcare' },
  { name: 'Drug Interaction Checker', description: 'AI-powered medication interaction analysis', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Identify dangerous drug combinations', dataInputs: 'Medication list, patient conditions', dataOutputs: 'Interaction warnings, alternatives', thirdPartyAPIs: ['DrugBank API', 'RxNorm'], baseModels: ['Knowledge Graph', 'NLP'], trainingDataSources: ['FDA adverse events'], domain: 'Healthcare' },
  { name: 'Patient Risk Stratifier', description: 'Hospital readmission risk prediction', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Identify high-risk patients for intervention', dataInputs: 'EHR data, social determinants, vitals', dataOutputs: 'Risk score, care recommendations', thirdPartyAPIs: ['Epic Predictive Model'], baseModels: ['LACE Index', 'Deep Learning'], trainingDataSources: ['Hospital records'], domain: 'Healthcare' },
  { name: 'Pathology Slide Analyzer', description: 'Digital pathology image classification', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Assist pathologists in tissue analysis', dataInputs: 'Whole slide images, patient history', dataOutputs: 'Cell classification, cancer staging', thirdPartyAPIs: ['PathAI'], baseModels: ['Vision Transformer'], trainingDataSources: ['Annotated slides'], domain: 'Healthcare' },
  { name: 'Clinical Trial Matcher', description: 'Patient-trial matching system', systemType: 'GENAI', dataClassification: 'RESTRICTED', purpose: 'Match patients with eligible clinical trials', dataInputs: 'Patient records, trial protocols', dataOutputs: 'Trial matches, eligibility status', thirdPartyAPIs: ['ClinicalTrials.gov'], baseModels: ['NLP', 'Semantic Search'], trainingDataSources: ['Trial outcomes'], domain: 'Healthcare' },
  { name: 'Mental Health Chatbot', description: 'AI companion for mental wellness support', systemType: 'GENAI', dataClassification: 'RESTRICTED', purpose: 'Provide mental health support and triage', dataInputs: 'User messages, mood tracking', dataOutputs: 'Responses, crisis alerts', thirdPartyAPIs: ['Crisis Text Line'], baseModels: ['LLaMA', 'BERT'], trainingDataSources: ['Therapy transcripts'], domain: 'Healthcare' },
  { name: 'Sepsis Early Warning', description: 'Real-time sepsis risk monitoring', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Early detection of sepsis onset', dataInputs: 'Vital signs, lab values, medications', dataOutputs: 'Sepsis probability, alert triggers', thirdPartyAPIs: ['EHR Integration'], baseModels: ['LSTM', 'Gradient Boosting'], trainingDataSources: ['ICU records'], domain: 'Healthcare' },
  { name: 'Genomic Variant Classifier', description: 'Genetic mutation classification system', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Classify genetic variants for diagnosis', dataInputs: 'Genome sequences, variant calls', dataOutputs: 'Pathogenicity classification', thirdPartyAPIs: ['ClinVar', 'gnomAD'], baseModels: ['Deep Learning', 'Random Forest'], trainingDataSources: ['Annotated variants'], domain: 'Healthcare' },
  { name: 'Appointment No-Show Predictor', description: 'Patient appointment attendance prediction', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Predict and prevent appointment no-shows', dataInputs: 'Patient history, appointment details', dataOutputs: 'No-show probability, intervention recommendations', thirdPartyAPIs: ['Scheduling API'], baseModels: ['Logistic Regression'], trainingDataSources: ['Appointment records'], domain: 'Healthcare' },

  // RETAIL & E-COMMERCE (100 systems)
  { name: 'Product Recommendation Engine', description: 'Personalized product recommendations', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Increase conversion through relevant suggestions', dataInputs: 'Browse history, purchase history, demographics', dataOutputs: 'Product recommendations, ranking scores', thirdPartyAPIs: ['AWS Personalize'], baseModels: ['Collaborative Filtering', 'Deep Learning'], trainingDataSources: ['Transaction data'], domain: 'Retail' },
  { name: 'Dynamic Pricing Engine', description: 'Real-time price optimization system', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Optimize prices based on demand and competition', dataInputs: 'Demand signals, competitor prices, inventory', dataOutputs: 'Optimal prices, price elasticity', thirdPartyAPIs: ['Competitor API'], baseModels: ['Reinforcement Learning'], trainingDataSources: ['Sales history'], domain: 'Retail' },
  { name: 'Demand Forecasting System', description: 'Sales and inventory demand prediction', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Forecast product demand for inventory planning', dataInputs: 'Historical sales, seasonality, promotions', dataOutputs: 'Demand forecasts, confidence intervals', thirdPartyAPIs: ['Weather API'], baseModels: ['Prophet', 'ARIMA', 'LSTM'], trainingDataSources: ['POS data'], domain: 'Retail' },
  { name: 'Customer Sentiment Analyzer', description: 'Review and feedback sentiment analysis', systemType: 'GENAI', dataClassification: 'INTERNAL', purpose: 'Analyze customer sentiment from reviews', dataInputs: 'Reviews, social media, support tickets', dataOutputs: 'Sentiment scores, topic extraction', thirdPartyAPIs: ['Twitter API'], baseModels: ['BERT', 'RoBERTa'], trainingDataSources: ['Labeled reviews'], domain: 'Retail' },
  { name: 'Visual Search Engine', description: 'Image-based product search', systemType: 'ML', dataClassification: 'PUBLIC', purpose: 'Enable product search using images', dataInputs: 'User uploaded images', dataOutputs: 'Matching products, similarity scores', thirdPartyAPIs: ['Google Vision'], baseModels: ['CNN', 'CLIP'], trainingDataSources: ['Product catalog'], domain: 'Retail' },
  { name: 'Inventory Optimization AI', description: 'Multi-location inventory management', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Optimize inventory levels across locations', dataInputs: 'Sales data, lead times, costs', dataOutputs: 'Reorder points, safety stock levels', thirdPartyAPIs: ['ERP Integration'], baseModels: ['Stochastic Optimization'], trainingDataSources: ['Inventory history'], domain: 'Retail' },
  { name: 'Chatbot Customer Service', description: 'AI-powered customer support chatbot', systemType: 'GENAI', dataClassification: 'INTERNAL', purpose: 'Handle customer inquiries automatically', dataInputs: 'Customer messages, order history', dataOutputs: 'Responses, escalation triggers', thirdPartyAPIs: ['Zendesk', 'Intercom'], baseModels: ['GPT-4', 'Claude'], trainingDataSources: ['Support tickets'], domain: 'Retail' },
  { name: 'Return Fraud Detector', description: 'Detect fraudulent return requests', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Identify suspicious return patterns', dataInputs: 'Return requests, customer history', dataOutputs: 'Fraud probability, recommended action', thirdPartyAPIs: ['Internal Risk API'], baseModels: ['Anomaly Detection'], trainingDataSources: ['Fraud cases'], domain: 'Retail' },

  // MANUFACTURING (100 systems)
  { name: 'Predictive Maintenance AI', description: 'Equipment failure prediction system', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Predict equipment failures before they occur', dataInputs: 'Sensor data, maintenance logs, operating conditions', dataOutputs: 'Failure predictions, maintenance schedules', thirdPartyAPIs: ['IoT Platform'], baseModels: ['LSTM', 'Random Forest'], trainingDataSources: ['Failure history'], domain: 'Manufacturing' },
  { name: 'Quality Control Vision', description: 'Visual inspection for defect detection', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Automated visual quality inspection', dataInputs: 'Product images, specifications', dataOutputs: 'Defect classification, pass/fail', thirdPartyAPIs: ['Camera Integration'], baseModels: ['YOLO', 'ResNet'], trainingDataSources: ['Defect images'], domain: 'Manufacturing' },
  { name: 'Supply Chain Optimizer', description: 'Supply chain route and inventory optimization', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Optimize logistics and supply chain', dataInputs: 'Demand forecasts, supplier data, costs', dataOutputs: 'Optimal routes, order quantities', thirdPartyAPIs: ['SAP Integration'], baseModels: ['Linear Programming', 'Genetic Algorithms'], trainingDataSources: ['Historical shipments'], domain: 'Manufacturing' },
  { name: 'Production Scheduling AI', description: 'Intelligent production planning', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Optimize production schedules', dataInputs: 'Orders, capacity, constraints', dataOutputs: 'Production schedules, resource allocation', thirdPartyAPIs: ['MES Integration'], baseModels: ['Constraint Programming'], trainingDataSources: ['Production history'], domain: 'Manufacturing' },
  { name: 'Energy Consumption Optimizer', description: 'Factory energy management AI', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Reduce energy consumption', dataInputs: 'Energy meters, production data, weather', dataOutputs: 'Energy recommendations, savings estimates', thirdPartyAPIs: ['Smart Grid API'], baseModels: ['Regression', 'Optimization'], trainingDataSources: ['Energy data'], domain: 'Manufacturing' },
  { name: 'Robotic Process Controller', description: 'AI-controlled robotic assembly', systemType: 'RPA', dataClassification: 'INTERNAL', purpose: 'Control robotic assembly operations', dataInputs: 'Sensor data, assembly instructions', dataOutputs: 'Robot commands, quality metrics', thirdPartyAPIs: ['Robot API'], baseModels: ['Reinforcement Learning'], trainingDataSources: ['Operation logs'], domain: 'Manufacturing' },
  { name: 'Safety Incident Predictor', description: 'Workplace safety risk prediction', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Predict and prevent safety incidents', dataInputs: 'Near-miss reports, conditions, schedules', dataOutputs: 'Risk scores, safety recommendations', thirdPartyAPIs: ['OSHA API'], baseModels: ['Bayesian Networks'], trainingDataSources: ['Incident reports'], domain: 'Manufacturing' },

  // HR & RECRUITMENT (80 systems)
  { name: 'Resume Screening AI', description: 'Automated resume parsing and ranking', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL', purpose: 'Screen and rank job applicants', dataInputs: 'Resumes, job descriptions', dataOutputs: 'Candidate rankings, skill matches', thirdPartyAPIs: ['LinkedIn API'], baseModels: ['BERT', 'GPT-4'], trainingDataSources: ['Hiring outcomes'], domain: 'HR' },
  { name: 'Employee Attrition Predictor', description: 'Predicts employee turnover risk', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Identify flight risk employees', dataInputs: 'HR data, engagement scores, performance', dataOutputs: 'Attrition probability, risk factors', thirdPartyAPIs: ['HRIS Integration'], baseModels: ['Gradient Boosting'], trainingDataSources: ['Exit data'], domain: 'HR' },
  { name: 'Performance Review Analyzer', description: 'AI-assisted performance evaluation', systemType: 'GENAI', dataClassification: 'RESTRICTED', purpose: 'Analyze and summarize performance reviews', dataInputs: 'Review text, metrics, peer feedback', dataOutputs: 'Summary, recommendations', thirdPartyAPIs: ['Workday API'], baseModels: ['NLP', 'Summarization'], trainingDataSources: ['Past reviews'], domain: 'HR' },
  { name: 'Compensation Benchmarker', description: 'Market compensation analysis', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Benchmark compensation against market', dataInputs: 'Job data, geography, experience levels', dataOutputs: 'Salary ranges, recommendations', thirdPartyAPIs: ['Glassdoor API', 'PayScale'], baseModels: ['Regression'], trainingDataSources: ['Salary surveys'], domain: 'HR' },
  { name: 'Interview Scheduler AI', description: 'Intelligent interview scheduling', systemType: 'RPA', dataClassification: 'INTERNAL', purpose: 'Automate interview scheduling', dataInputs: 'Calendars, preferences, constraints', dataOutputs: 'Optimal schedules, invitations', thirdPartyAPIs: ['Calendar APIs'], baseModels: ['Constraint Satisfaction'], trainingDataSources: ['Scheduling patterns'], domain: 'HR' },
  { name: 'Skills Gap Analyzer', description: 'Workforce skills assessment', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Identify organizational skill gaps', dataInputs: 'Employee skills, job requirements', dataOutputs: 'Gap analysis, training recommendations', thirdPartyAPIs: ['LinkedIn Learning'], baseModels: ['NLP', 'Matching'], trainingDataSources: ['Job market data'], domain: 'HR' },
  { name: 'Diversity Analytics Engine', description: 'DEI metrics and analysis', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Track and improve diversity metrics', dataInputs: 'Demographic data, hiring data', dataOutputs: 'DEI metrics, bias indicators', thirdPartyAPIs: ['EEOC Reporting'], baseModels: ['Statistical Analysis'], trainingDataSources: ['Workforce data'], domain: 'HR' },

  // LEGAL (60 systems)
  { name: 'Contract Analyzer AI', description: 'Automated contract review and extraction', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL', purpose: 'Extract and analyze contract terms', dataInputs: 'Contract documents', dataOutputs: 'Key terms, risk clauses, summaries', thirdPartyAPIs: ['DocuSign'], baseModels: ['GPT-4', 'Legal BERT'], trainingDataSources: ['Contract corpus'], domain: 'Legal' },
  { name: 'Legal Research Assistant', description: 'AI-powered legal research tool', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL', purpose: 'Find relevant case law and precedents', dataInputs: 'Legal queries, jurisdiction', dataOutputs: 'Relevant cases, citations', thirdPartyAPIs: ['Westlaw', 'LexisNexis'], baseModels: ['Claude', 'GPT-4'], trainingDataSources: ['Legal databases'], domain: 'Legal' },
  { name: 'eDiscovery Classifier', description: 'Document classification for litigation', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Classify documents for discovery', dataInputs: 'Document collections', dataOutputs: 'Relevance scores, privilege flags', thirdPartyAPIs: ['Relativity'], baseModels: ['Document Classification'], trainingDataSources: ['Coded documents'], domain: 'Legal' },
  { name: 'Patent Analysis AI', description: 'Prior art search and patent analysis', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL', purpose: 'Analyze patents and find prior art', dataInputs: 'Patent applications, claims', dataOutputs: 'Prior art matches, novelty assessment', thirdPartyAPIs: ['USPTO API'], baseModels: ['Semantic Search'], trainingDataSources: ['Patent database'], domain: 'Legal' },
  { name: 'Compliance Document Generator', description: 'Automated regulatory document drafting', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL', purpose: 'Generate compliance documentation', dataInputs: 'Requirements, templates', dataOutputs: 'Draft documents, checklists', thirdPartyAPIs: ['Template Engine'], baseModels: ['GPT-4'], trainingDataSources: ['Compliance templates'], domain: 'Legal' },

  // MARKETING & ADVERTISING (80 systems)
  { name: 'Customer Segmentation AI', description: 'Advanced customer clustering and profiling', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Segment customers for targeted marketing', dataInputs: 'Customer behavior, transactions, demographics', dataOutputs: 'Segment assignments, personas', thirdPartyAPIs: ['Segment', 'mParticle'], baseModels: ['K-Means', 'DBSCAN'], trainingDataSources: ['Customer data'], domain: 'Marketing' },
  { name: 'Ad Targeting Optimizer', description: 'Programmatic ad targeting system', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Optimize ad targeting and bidding', dataInputs: 'User data, ad inventory, budgets', dataOutputs: 'Targeting parameters, bid amounts', thirdPartyAPIs: ['Google Ads', 'Meta Ads'], baseModels: ['Multi-Armed Bandit'], trainingDataSources: ['Campaign data'], domain: 'Marketing' },
  { name: 'Content Personalization Engine', description: 'Website content personalization', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Personalize web content for visitors', dataInputs: 'User behavior, preferences', dataOutputs: 'Content variants, layouts', thirdPartyAPIs: ['Adobe Target'], baseModels: ['Contextual Bandit'], trainingDataSources: ['A/B test data'], domain: 'Marketing' },
  { name: 'Attribution Model AI', description: 'Marketing attribution analysis', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Attribute conversions to marketing channels', dataInputs: 'Touchpoint data, conversions', dataOutputs: 'Attribution weights, ROI by channel', thirdPartyAPIs: ['Google Analytics'], baseModels: ['Markov Chain', 'Shapley Value'], trainingDataSources: ['Conversion paths'], domain: 'Marketing' },
  { name: 'Social Media Analyzer', description: 'Social listening and trend analysis', systemType: 'GENAI', dataClassification: 'INTERNAL', purpose: 'Monitor brand mentions and trends', dataInputs: 'Social media feeds', dataOutputs: 'Sentiment, trends, influencers', thirdPartyAPIs: ['Twitter API', 'Meta API'], baseModels: ['BERT', 'Topic Modeling'], trainingDataSources: ['Social data'], domain: 'Marketing' },
  { name: 'Email Campaign Optimizer', description: 'Email marketing optimization', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Optimize email send times and content', dataInputs: 'Email metrics, subscriber data', dataOutputs: 'Optimal send times, subject lines', thirdPartyAPIs: ['Mailchimp', 'SendGrid'], baseModels: ['Bayesian Optimization'], trainingDataSources: ['Email history'], domain: 'Marketing' },
  { name: 'Lead Scoring System', description: 'B2B lead qualification scoring', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Score and prioritize sales leads', dataInputs: 'Lead data, engagement signals', dataOutputs: 'Lead scores, qualification status', thirdPartyAPIs: ['Salesforce', 'HubSpot'], baseModels: ['Gradient Boosting'], trainingDataSources: ['Conversion data'], domain: 'Marketing' },

  // LOGISTICS & TRANSPORTATION (60 systems)
  { name: 'Route Optimization Engine', description: 'Delivery route planning and optimization', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Optimize delivery routes for efficiency', dataInputs: 'Delivery points, traffic, constraints', dataOutputs: 'Optimal routes, ETAs', thirdPartyAPIs: ['Google Maps', 'HERE'], baseModels: ['Vehicle Routing Problem'], trainingDataSources: ['Delivery history'], domain: 'Logistics' },
  { name: 'Warehouse Automation AI', description: 'Warehouse robot coordination', systemType: 'RPA', dataClassification: 'INTERNAL', purpose: 'Coordinate warehouse robots', dataInputs: 'Orders, inventory locations', dataOutputs: 'Robot tasks, paths', thirdPartyAPIs: ['WMS Integration'], baseModels: ['Multi-Agent RL'], trainingDataSources: ['Warehouse operations'], domain: 'Logistics' },
  { name: 'Fleet Management AI', description: 'Vehicle fleet optimization', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Optimize fleet utilization and maintenance', dataInputs: 'Telematics, schedules, costs', dataOutputs: 'Assignments, maintenance schedules', thirdPartyAPIs: ['Geotab', 'Samsara'], baseModels: ['Optimization'], trainingDataSources: ['Fleet data'], domain: 'Logistics' },
  { name: 'Shipment ETA Predictor', description: 'Delivery time estimation', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Predict accurate delivery times', dataInputs: 'Shipment data, traffic, weather', dataOutputs: 'ETA predictions, delays', thirdPartyAPIs: ['Carrier APIs'], baseModels: ['Regression', 'LSTM'], trainingDataSources: ['Delivery history'], domain: 'Logistics' },
  { name: 'Cargo Damage Classifier', description: 'Shipping damage assessment', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Classify cargo damage from images', dataInputs: 'Damage photos, shipment data', dataOutputs: 'Damage classification, severity', thirdPartyAPIs: ['Insurance API'], baseModels: ['CNN'], trainingDataSources: ['Damage records'], domain: 'Logistics' },

  // TELECOMMUNICATIONS (50 systems)
  { name: 'Network Anomaly Detector', description: 'Network traffic anomaly detection', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Detect network intrusions and anomalies', dataInputs: 'Network traffic, logs', dataOutputs: 'Anomaly alerts, threat classification', thirdPartyAPIs: ['SIEM Integration'], baseModels: ['Autoencoder', 'Isolation Forest'], trainingDataSources: ['Traffic data'], domain: 'Telecom' },
  { name: 'Customer Value Predictor', description: 'Telecom customer lifetime value', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Predict customer lifetime value', dataInputs: 'Usage data, billing, tenure', dataOutputs: 'CLV prediction, segment', thirdPartyAPIs: ['Billing System'], baseModels: ['Survival Analysis'], trainingDataSources: ['Customer history'], domain: 'Telecom' },
  { name: 'Network Capacity Planner', description: 'Bandwidth and capacity forecasting', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Plan network capacity expansion', dataInputs: 'Traffic patterns, growth trends', dataOutputs: 'Capacity forecasts, recommendations', thirdPartyAPIs: ['Network Monitoring'], baseModels: ['Time Series'], trainingDataSources: ['Network metrics'], domain: 'Telecom' },
  { name: '5G Coverage Optimizer', description: 'Optimal cell tower placement', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Optimize 5G network coverage', dataInputs: 'Geography, population, existing coverage', dataOutputs: 'Optimal locations, coverage maps', thirdPartyAPIs: ['GIS Services'], baseModels: ['Optimization'], trainingDataSources: ['Coverage data'], domain: 'Telecom' },

  // ENERGY & UTILITIES (50 systems)
  { name: 'Smart Grid Optimizer', description: 'Electricity grid load balancing', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Optimize power grid operations', dataInputs: 'Demand data, generation, weather', dataOutputs: 'Load dispatch, pricing signals', thirdPartyAPIs: ['Grid API'], baseModels: ['Optimization', 'Forecasting'], trainingDataSources: ['Grid history'], domain: 'Energy' },
  { name: 'Solar Generation Forecaster', description: 'Solar power output prediction', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Forecast solar energy generation', dataInputs: 'Weather data, panel specs', dataOutputs: 'Generation forecasts', thirdPartyAPIs: ['Weather API'], baseModels: ['LSTM', 'XGBoost'], trainingDataSources: ['Generation data'], domain: 'Energy' },
  { name: 'Energy Trading AI', description: 'Electricity market trading', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Optimize energy trading decisions', dataInputs: 'Market prices, demand, generation', dataOutputs: 'Trading strategies, positions', thirdPartyAPIs: ['Market API'], baseModels: ['Reinforcement Learning'], trainingDataSources: ['Market history'], domain: 'Energy' },
  { name: 'Outage Prediction System', description: 'Power outage forecasting', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Predict and prevent power outages', dataInputs: 'Equipment data, weather, load', dataOutputs: 'Outage predictions, prevention actions', thirdPartyAPIs: ['Weather Service'], baseModels: ['Random Forest'], trainingDataSources: ['Outage history'], domain: 'Energy' },
  { name: 'Smart Meter Analytics', description: 'Consumer energy usage analysis', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Analyze consumer energy patterns', dataInputs: 'Smart meter readings', dataOutputs: 'Usage patterns, recommendations', thirdPartyAPIs: ['Meter API'], baseModels: ['Clustering', 'Anomaly Detection'], trainingDataSources: ['Meter data'], domain: 'Energy' },

  // GOVERNMENT & PUBLIC SECTOR (40 systems)
  { name: 'Benefits Eligibility Checker', description: 'Government benefits qualification AI', systemType: 'RPA', dataClassification: 'RESTRICTED', purpose: 'Determine benefits eligibility', dataInputs: 'Application data, income, household', dataOutputs: 'Eligibility determination, amount', thirdPartyAPIs: ['SSA API'], baseModels: ['Rule Engine', 'ML Classifier'], trainingDataSources: ['Case history'], domain: 'Government' },
  { name: 'Tax Audit Selector', description: 'Tax return audit risk scoring', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Identify returns for audit', dataInputs: 'Tax returns, third-party data', dataOutputs: 'Audit scores, anomaly flags', thirdPartyAPIs: ['IRS Systems'], baseModels: ['Anomaly Detection'], trainingDataSources: ['Audit outcomes'], domain: 'Government' },
  { name: 'Public Safety Predictor', description: 'Crime hotspot prediction', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Predict crime patterns for patrol allocation', dataInputs: 'Crime history, events, demographics', dataOutputs: 'Hotspot maps, patrol recommendations', thirdPartyAPIs: ['CAD Systems'], baseModels: ['Spatial Analysis'], trainingDataSources: ['Crime data'], domain: 'Government' },
  { name: 'Document Processing AI', description: 'Government form digitization', systemType: 'GENAI', dataClassification: 'RESTRICTED', purpose: 'Digitize and extract form data', dataInputs: 'Scanned documents', dataOutputs: 'Extracted fields, validation', thirdPartyAPIs: ['OCR Services'], baseModels: ['Vision AI', 'NER'], trainingDataSources: ['Form samples'], domain: 'Government' },
  { name: 'Citizen Service Chatbot', description: 'Government services assistant', systemType: 'GENAI', dataClassification: 'PUBLIC', purpose: 'Answer citizen queries about services', dataInputs: 'User questions', dataOutputs: 'Service information, directions', thirdPartyAPIs: ['CRM Integration'], baseModels: ['GPT-4', 'Claude'], trainingDataSources: ['FAQ database'], domain: 'Government' },

  // EDUCATION (30 systems)
  { name: 'Adaptive Learning Platform', description: 'Personalized learning path AI', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Personalize learning experiences', dataInputs: 'Student performance, preferences', dataOutputs: 'Learning paths, recommendations', thirdPartyAPIs: ['LMS Integration'], baseModels: ['Knowledge Tracing'], trainingDataSources: ['Learning data'], domain: 'Education' },
  { name: 'Essay Grading AI', description: 'Automated essay scoring', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL', purpose: 'Grade and provide feedback on essays', dataInputs: 'Student essays, rubrics', dataOutputs: 'Scores, feedback', thirdPartyAPIs: ['Turnitin'], baseModels: ['BERT', 'GPT-4'], trainingDataSources: ['Graded essays'], domain: 'Education' },
  { name: 'Student Risk Identifier', description: 'At-risk student early warning', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Identify students at risk of failure', dataInputs: 'Grades, attendance, engagement', dataOutputs: 'Risk scores, interventions', thirdPartyAPIs: ['SIS Integration'], baseModels: ['Classification'], trainingDataSources: ['Student outcomes'], domain: 'Education' },
  { name: 'Plagiarism Detector', description: 'Academic integrity checker', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL', purpose: 'Detect plagiarism and AI-generated content', dataInputs: 'Student submissions', dataOutputs: 'Similarity scores, AI detection', thirdPartyAPIs: ['Turnitin', 'Originality'], baseModels: ['Semantic Similarity'], trainingDataSources: ['Document corpus'], domain: 'Education' },

  // REAL ESTATE (30 systems)
  { name: 'Property Valuation AI', description: 'Automated property appraisal', systemType: 'ML', dataClassification: 'CONFIDENTIAL', purpose: 'Estimate property market values', dataInputs: 'Property data, comparables, market trends', dataOutputs: 'Value estimate, confidence interval', thirdPartyAPIs: ['MLS API', 'Zillow'], baseModels: ['Gradient Boosting', 'Neural Network'], trainingDataSources: ['Sales history'], domain: 'Real Estate' },
  { name: 'Tenant Screening AI', description: 'Rental applicant assessment', systemType: 'ML', dataClassification: 'RESTRICTED', purpose: 'Screen and score rental applicants', dataInputs: 'Application data, credit, references', dataOutputs: 'Screening score, recommendations', thirdPartyAPIs: ['Credit Bureaus'], baseModels: ['Classification'], trainingDataSources: ['Tenant history'], domain: 'Real Estate' },
  { name: 'Market Trend Analyzer', description: 'Real estate market analysis', systemType: 'ML', dataClassification: 'INTERNAL', purpose: 'Analyze and forecast market trends', dataInputs: 'Listings, sales, economic data', dataOutputs: 'Trend forecasts, market insights', thirdPartyAPIs: ['CoStar', 'Redfin'], baseModels: ['Time Series'], trainingDataSources: ['Market data'], domain: 'Real Estate' },
  { name: 'Virtual Staging AI', description: 'AI-powered virtual property staging', systemType: 'GENAI', dataClassification: 'PUBLIC', purpose: 'Virtually stage empty properties', dataInputs: 'Property photos, style preferences', dataOutputs: 'Staged images', thirdPartyAPIs: ['Image Generation'], baseModels: ['Stable Diffusion'], trainingDataSources: ['Interior images'], domain: 'Real Estate' },
];

// Risk assessment templates
const RISK_TEMPLATES = [
  { title: 'Model Bias Assessment', category: 'BIAS_FAIRNESS', description: 'Evaluation of potential discriminatory outcomes across protected groups' },
  { title: 'Data Privacy Review', category: 'PRIVACY', description: 'Assessment of PII handling and data protection compliance' },
  { title: 'Security Vulnerability Analysis', category: 'SECURITY', description: 'Identification of potential security weaknesses and attack vectors' },
  { title: 'System Reliability Evaluation', category: 'RELIABILITY', description: 'Assessment of system uptime, error handling, and fault tolerance' },
  { title: 'Explainability Assessment', category: 'TRANSPARENCY', description: 'Evaluation of model interpretability and decision transparency' },
  { title: 'Governance Framework Review', category: 'ACCOUNTABILITY', description: 'Assessment of oversight mechanisms and responsibility chains' },
  { title: 'Safety Impact Analysis', category: 'SAFETY', description: 'Evaluation of potential harm to users and stakeholders' },
  { title: 'Third-Party Risk Assessment', category: 'OTHER', description: 'Review of risks from external dependencies and vendors' },
];

// Evidence document templates
const EVIDENCE_TEMPLATES = [
  { filename: 'data-protection-policy.pdf', type: 'Policy', description: 'Organization data protection and privacy policy document' },
  { filename: 'model-validation-report.pdf', type: 'Report', description: 'Independent model validation and testing results' },
  { filename: 'security-audit-2025.pdf', type: 'Audit', description: 'Annual security audit conducted by external auditor' },
  { filename: 'bias-testing-results.xlsx', type: 'Test Results', description: 'Fairness and bias testing across demographic groups' },
  { filename: 'incident-response-procedure.pdf', type: 'Procedure', description: 'AI incident response and escalation procedures' },
  { filename: 'training-completion-records.csv', type: 'Training', description: 'Staff AI ethics and governance training records' },
  { filename: 'model-documentation.pdf', type: 'Documentation', description: 'Technical model card and system documentation' },
  { filename: 'data-lineage-diagram.pdf', type: 'Documentation', description: 'Data flow and lineage documentation' },
  { filename: 'third-party-assessment.pdf', type: 'Assessment', description: 'Vendor and third-party risk assessment' },
  { filename: 'compliance-checklist.xlsx', type: 'Checklist', description: 'Regulatory compliance verification checklist' },
];

// Helper functions
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateSystemName(template: AISystemTemplate, index: number): string {
  const variations = ['v2', 'Pro', 'Enterprise', 'Plus', 'Advanced', 'Next', 'Core', 'Ultra', 'Max', 'Elite'];
  const regions = ['APAC', 'EMEA', 'Americas', 'Global', 'US', 'EU', 'UK', 'ANZ'];

  if (index % 5 === 0) return `${template.name} ${randomChoice(variations)}`;
  if (index % 7 === 0) return `${template.name} - ${randomChoice(regions)}`;
  if (index % 11 === 0) return `${template.name} (${template.domain})`;
  return template.name;
}

export async function seedMockData() {
  console.log('\n🚀 Starting comprehensive mock data seed...\n');

  // Get organization and admin user
  const organization = await prisma.organization.findFirst({ where: { slug: 'airm-ip-demo' } });
  if (!organization) {
    console.log('❌ Organization not found. Run base seed first.');
    return;
  }

  const adminUser = await prisma.user.findFirst({
    where: { organizationId: organization.id, role: 'ADMIN' },
  });
  if (!adminUser) {
    console.log('❌ Admin user not found. Run base seed first.');
    return;
  }

  // Get all users for random assignment
  const users = await prisma.user.findMany({ where: { organizationId: organization.id } });

  // Get all frameworks
  const frameworks = await prisma.framework.findMany({ where: { isActive: true } });
  if (frameworks.length === 0) {
    console.log('❌ No frameworks found. Run framework seed first.');
    return;
  }

  console.log(`📊 Found ${frameworks.length} frameworks`);

  // ============================================================================
  // SEED AI SYSTEMS (1000)
  // ============================================================================
  console.log('\n📱 Creating 1000 AI Systems...');

  const aiSystems: { id: string; name: string; riskTier: RiskTier | null }[] = [];
  const lifecycleStatuses: LifecycleStatus[] = ['DEVELOPMENT', 'PILOT', 'PRODUCTION', 'DEPRECATED', 'RETIRED'];
  const riskTiers: RiskTier[] = ['HIGH', 'MEDIUM', 'LOW'];

  // Delete existing AI systems first
  await prisma.aISystem.deleteMany({ where: { organizationId: organization.id } });

  for (let i = 0; i < 1000; i++) {
    const template = AI_SYSTEM_TEMPLATES[i % AI_SYSTEM_TEMPLATES.length];
    const name = generateSystemName(template, i);

    // Weight lifecycle status towards production (more realistic)
    const lifecycleWeights = [15, 10, 60, 10, 5]; // DEVELOPMENT, PILOT, PRODUCTION, DEPRECATED, RETIRED
    let statusIndex = 0;
    let cumulative = 0;
    const rand = Math.random() * 100;
    for (let j = 0; j < lifecycleWeights.length; j++) {
      cumulative += lifecycleWeights[j];
      if (rand < cumulative) {
        statusIndex = j;
        break;
      }
    }
    const lifecycleStatus = lifecycleStatuses[statusIndex];

    // Risk tier weighted by data classification
    let riskTier: RiskTier;
    if (template.dataClassification === 'RESTRICTED') {
      riskTier = Math.random() < 0.6 ? 'HIGH' : (Math.random() < 0.7 ? 'MEDIUM' : 'LOW');
    } else if (template.dataClassification === 'CONFIDENTIAL') {
      riskTier = Math.random() < 0.3 ? 'HIGH' : (Math.random() < 0.6 ? 'MEDIUM' : 'LOW');
    } else {
      riskTier = Math.random() < 0.1 ? 'HIGH' : (Math.random() < 0.4 ? 'MEDIUM' : 'LOW');
    }

    const system = await prisma.aISystem.create({
      data: {
        name,
        description: `${template.description}. Deployed for ${template.domain} operations.`,
        systemType: template.systemType,
        dataClassification: template.dataClassification,
        lifecycleStatus,
        riskTier,
        purpose: template.purpose,
        dataInputs: template.dataInputs,
        dataOutputs: template.dataOutputs,
        thirdPartyAPIs: template.thirdPartyAPIs,
        baseModels: template.baseModels,
        trainingDataSources: template.trainingDataSources,
        organizationId: organization.id,
        ownerId: randomChoice(users).id,
        createdAt: randomDate(new Date('2024-01-01'), new Date()),
      },
    });

    aiSystems.push({ id: system.id, name: system.name, riskTier: system.riskTier });

    if ((i + 1) % 100 === 0) {
      console.log(`  ✅ Created ${i + 1} AI systems...`);
    }
  }

  console.log(`✅ Created ${aiSystems.length} AI systems`);

  // ============================================================================
  // SEED RISK ASSESSMENTS (100)
  // ============================================================================
  console.log('\n📋 Creating 100 Risk Assessments with risks...');

  const assessmentStatuses: AssessmentStatus[] = ['DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'ARCHIVED'];
  const treatmentStatuses: TreatmentStatus[] = ['PENDING', 'ACCEPTED', 'MITIGATING', 'TRANSFERRED', 'AVOIDED', 'COMPLETED'];

  // Delete existing assessments first
  await prisma.riskAssessment.deleteMany({ where: { organizationId: organization.id } });

  for (let i = 0; i < 100; i++) {
    const aiSystem = aiSystems[i % aiSystems.length];
    const framework = randomChoice(frameworks);

    // Weight status towards approved (realistic enterprise scenario)
    const statusWeights = [5, 10, 15, 60, 10]; // DRAFT, IN_PROGRESS, UNDER_REVIEW, APPROVED, ARCHIVED
    let statusIndex = 0;
    let cumulative = 0;
    const rand = Math.random() * 100;
    for (let j = 0; j < statusWeights.length; j++) {
      cumulative += statusWeights[j];
      if (rand < cumulative) {
        statusIndex = j;
        break;
      }
    }
    const status = assessmentStatuses[statusIndex];

    const assessmentDate = randomDate(new Date('2024-06-01'), new Date());
    const nextReviewDate = new Date(assessmentDate);
    nextReviewDate.setMonth(nextReviewDate.getMonth() + randomInt(6, 12));

    const assessment = await prisma.riskAssessment.create({
      data: {
        title: `${framework.shortName} Assessment - ${aiSystem.name}`,
        description: `Comprehensive ${framework.name} compliance assessment for ${aiSystem.name}`,
        status,
        assessmentDate,
        nextReviewDate: status === 'APPROVED' ? nextReviewDate : null,
        completedAt: status === 'APPROVED' || status === 'ARCHIVED' ? assessmentDate : null,
        organizationId: organization.id,
        aiSystemId: aiSystem.id,
        frameworkId: framework.id,
        createdById: randomChoice(users).id,
      },
    });

    // Create 3-8 risks per assessment
    const numRisks = randomInt(3, 8);
    for (let j = 0; j < numRisks; j++) {
      const riskTemplate = RISK_TEMPLATES[j % RISK_TEMPLATES.length];

      // Higher likelihood and impact for HIGH risk tier systems
      let likelihood = randomInt(1, 5);
      let impact = randomInt(1, 5);

      if (aiSystem.riskTier === 'HIGH') {
        likelihood = Math.min(5, likelihood + 1);
        impact = Math.min(5, impact + 1);
      } else if (aiSystem.riskTier === 'LOW') {
        likelihood = Math.max(1, likelihood - 1);
        impact = Math.max(1, impact - 1);
      }

      const inherentScore = likelihood * impact;
      const controlEffectiveness = randomInt(20, 80) / 100;
      const residualScore = inherentScore * (1 - controlEffectiveness);

      await prisma.risk.create({
        data: {
          title: `${riskTemplate.title} - ${aiSystem.name}`,
          description: riskTemplate.description,
          category: riskTemplate.category as RiskCategory,
          likelihood,
          impact,
          inherentScore,
          controlEffectiveness,
          residualScore,
          treatmentStatus: randomChoice(treatmentStatuses),
          treatmentPlan: `Implement controls to address ${riskTemplate.title.toLowerCase()} concerns`,
          treatmentDueDate: randomDate(new Date(), new Date('2026-12-31')),
          assessmentId: assessment.id,
        },
      });
    }

    if ((i + 1) % 20 === 0) {
      console.log(`  ✅ Created ${i + 1} assessments with risks...`);
    }
  }

  console.log('✅ Created 100 risk assessments with associated risks');

  // ============================================================================
  // SEED EVIDENCE (100)
  // ============================================================================
  console.log('\n📎 Creating 100 Evidence records...');

  const evidenceStatuses: EvidenceStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'];

  // Delete existing evidence first
  await prisma.evidence.deleteMany({ where: { organizationId: organization.id } });

  for (let i = 0; i < 100; i++) {
    const template = EVIDENCE_TEMPLATES[i % EVIDENCE_TEMPLATES.length];
    const createdDate = randomDate(new Date('2024-01-01'), new Date());
    const validUntil = new Date(createdDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    // Weight status towards approved
    const statusWeights = [10, 15, 60, 5, 10];
    let statusIndex = 0;
    let cumulative = 0;
    const rand = Math.random() * 100;
    for (let j = 0; j < statusWeights.length; j++) {
      cumulative += statusWeights[j];
      if (rand < cumulative) {
        statusIndex = j;
        break;
      }
    }

    const evidence = await prisma.evidence.create({
      data: {
        filename: `${Date.now()}-${i}-${template.filename}`,
        originalName: template.filename,
        mimeType: template.filename.endsWith('.pdf') ? 'application/pdf' :
                  template.filename.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                  template.filename.endsWith('.csv') ? 'text/csv' : 'application/octet-stream',
        fileSize: randomInt(50000, 5000000),
        storagePath: `/evidence/${organization.id}/${Date.now()}-${template.filename}`,
        hashSha256: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
        description: `${template.description} - ${template.type}`,
        reviewStatus: evidenceStatuses[statusIndex],
        validUntil,
        organizationId: organization.id,
        uploadedById: randomChoice(users).id,
        createdAt: createdDate,
      },
    });

    // Link to random AI system
    if (Math.random() > 0.3) {
      const randomSystem = randomChoice(aiSystems);
      await prisma.evidenceLink.create({
        data: {
          entityType: 'AI_SYSTEM',
          evidenceId: evidence.id,
          aiSystemId: randomSystem.id,
        },
      });
    }

    if ((i + 1) % 20 === 0) {
      console.log(`  ✅ Created ${i + 1} evidence records...`);
    }
  }

  console.log('✅ Created 100 evidence records');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 Mock data seed completed successfully!');
  console.log('═'.repeat(60));

  const systemCount = await prisma.aISystem.count({ where: { organizationId: organization.id } });
  const assessmentCount = await prisma.riskAssessment.count({ where: { organizationId: organization.id } });
  const riskCount = await prisma.risk.count();
  const evidenceCount = await prisma.evidence.count({ where: { organizationId: organization.id } });

  console.log(`\n📊 Summary:`);
  console.log(`   AI Systems:       ${systemCount}`);
  console.log(`   Risk Assessments: ${assessmentCount}`);
  console.log(`   Risks:            ${riskCount}`);
  console.log(`   Evidence:         ${evidenceCount}`);
  console.log(`   Frameworks:       ${frameworks.length}`);
  console.log('\n' + '═'.repeat(60));
}

// Run if called directly
if (require.main === module) {
  seedMockData()
    .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
