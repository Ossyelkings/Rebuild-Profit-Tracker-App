import { useState } from 'react';
import { Vehicle, VehicleStatus, BodyType } from '../types';
import { ArrowLeft, Camera, X, Scan } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

interface AddVehicleProps {
  onBack: () => void;
  onSave: (vehicle: Vehicle) => void;
}

export function AddVehicle({ onBack, onSave }: AddVehicleProps) {
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    odometer: '',
    auction: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: '',
    transportCost: '',
    estimatedSalePrice: '',
    status: 'In Repair' as VehicleStatus,
    color: '',
    bodyType: 'Sedan' as BodyType,
    damageCondition: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [isDecodingVIN, setIsDecodingVIN] = useState(false);
  const [vinDecodeError, setVinDecodeError] = useState('');
  const [vinDecodeSuccess, setVinDecodeSuccess] = useState(false);
  const [decodedInfo, setDecodedInfo] = useState<any>(null);
  const [isScanningVIN, setIsScanningVIN] = useState(false);
  const [vinScanError, setVinScanError] = useState('');

  const statuses: VehicleStatus[] = [
    'In Repair',
    'Completed',
    'Sold',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const timestamp = new Date().toISOString();
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      name: formData.name || undefined,
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year),
      vin: formData.vin,
      odometer: parseInt(formData.odometer),
      auction: formData.auction,
      purchaseDate: formData.purchaseDate,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      transportCost: parseFloat(formData.transportCost) || 0,
      estimatedSalePrice: parseFloat(formData.estimatedSalePrice) || 0,
      status: formData.status,
      images: images,
      costs: [],
      activityLog: [
        {
          id: Date.now().toString(),
          timestamp: timestamp,
          type: 'vehicle_created',
          description: `Vehicle added: ${formData.year} ${formData.make} ${formData.model}`,
          details: `VIN: ${formData.vin}`,
        },
      ],
      color: formData.color,
      bodyType: formData.bodyType,
      damageCondition: formData.damageCondition,
    };

    onSave(newVehicle);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const decodeVIN = async (vin: string) => {
    // Validate VIN length
    if (!vin || vin.length !== 17) {
      setVinDecodeError('VIN must be exactly 17 characters');
      return;
    }

    setIsDecodingVIN(true);
    setVinDecodeError('');
    setVinDecodeSuccess(false);

    try {
      let result: any = {};
      let apiUsed = '';

      // Detect Australian VIN (typically starts with 6, 7, M, N, P or J for Japanese imports to Australia)
      const isLikelyAustralian = /^[6789MNPJ]/i.test(vin);

      // Try 1: VIN Audit API (Supports International including Australia)
      try {
        const vinAuditResponse = await fetch(`https://specifications.vinaudit.com/v3/specifications?format=json&key=VA_DEMO_KEY&vin=${vin}`);
        const vinAuditData = await vinAuditResponse.json();

        if (vinAuditData && vinAuditData.success && vinAuditData.attributes) {
          const attrs = vinAuditData.attributes;
          
          result = {
            Make: attrs.make || '',
            Model: attrs.model || '',
            ModelYear: attrs.year || '',
            BodyClass: attrs.body || '',
            Trim: attrs.trim || '',
            EngineModel: attrs.engine || '',
            EngineCylinders: attrs.cylinders || '',
            DisplacementL: attrs.displacement || '',
            TransmissionStyle: attrs.transmission || '',
            DriveType: attrs.drive_type || '',
            FuelTypePrimary: attrs.fuel_type || '',
            Doors: attrs.doors || '',
            PlantCountry: attrs.made_in || attrs.plant_country || '',
            Manufacturer: attrs.manufacturer || '',
          };

          apiUsed = 'VIN Audit';
          console.log('VIN Audit Result:', result);
        }
      } catch (error) {
        console.log('VIN Audit failed, trying next API...');
      }

      // Try 2: NHTSA API (Primarily US, but has some international data)
      if (!result.Make || !result.Model) {
        try {
          const nhtsaResponse = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
          const nhtsaData = await nhtsaResponse.json();

          if (nhtsaData.Results && nhtsaData.Results.length > 0) {
            const nhtsaResult = nhtsaData.Results[0];
            
            // Only use NHTSA data if it's better than what we have
            if (nhtsaResult.Make && nhtsaResult.ModelYear) {
              result = {
                Make: result.Make || nhtsaResult.Make,
                Model: result.Model || nhtsaResult.Model,
                ModelYear: result.ModelYear || nhtsaResult.ModelYear,
                BodyClass: result.BodyClass || nhtsaResult.BodyClass,
                Trim: result.Trim || nhtsaResult.Trim,
                EngineModel: result.EngineModel || nhtsaResult.EngineModel,
                EngineCylinders: result.EngineCylinders || nhtsaResult.EngineCylinders,
                DisplacementL: result.DisplacementL || nhtsaResult.DisplacementL,
                TransmissionStyle: result.TransmissionStyle || nhtsaResult.TransmissionStyle,
                DriveType: result.DriveType || nhtsaResult.DriveType,
                FuelTypePrimary: result.FuelTypePrimary || nhtsaResult.FuelTypePrimary,
                Doors: result.Doors || nhtsaResult.Doors,
                PlantCountry: result.PlantCountry || nhtsaResult.PlantCountry,
                Manufacturer: result.Manufacturer || nhtsaResult.Manufacturer,
              };
              
              if (!apiUsed) apiUsed = 'NHTSA';
              console.log('NHTSA Result:', nhtsaResult);
            }
          }
        } catch (error) {
          console.log('NHTSA API failed, trying next...');
        }
      }

      // Try 3: VINdecoder.pl API (Good for European and Australian imports)
      if (!result.Make || !result.Model) {
        try {
          const vinDecoderResponse = await fetch(`https://vindecoder.pl/api/v1/vin/${vin}`);
          const vinDecoderData = await vinDecoderResponse.json();

          if (vinDecoderData && vinDecoderData.manufacturer) {
            result = {
              Make: result.Make || vinDecoderData.manufacturer || '',
              Model: result.Model || vinDecoderData.model || '',
              ModelYear: result.ModelYear || vinDecoderData.year || '',
              BodyClass: result.BodyClass || vinDecoderData.body_type || '',
              Trim: result.Trim || '',
              EngineModel: result.EngineModel || vinDecoderData.engine || '',
              EngineCylinders: result.EngineCylinders || '',
              DisplacementL: result.DisplacementL || vinDecoderData.displacement || '',
              TransmissionStyle: result.TransmissionStyle || vinDecoderData.transmission || '',
              DriveType: result.DriveType || vinDecoderData.drive || '',
              FuelTypePrimary: result.FuelTypePrimary || vinDecoderData.fuel_type || '',
              Doors: result.Doors || '',
              PlantCountry: result.PlantCountry || vinDecoderData.region || '',
              Manufacturer: result.Manufacturer || vinDecoderData.manufacturer || '',
            };
            
            if (!apiUsed) apiUsed = 'VINDecoder.pl';
            console.log('VINDecoder.pl Result:', vinDecoderData);
          }
        } catch (error) {
          console.log('VINDecoder.pl API failed');
        }
      }

      // Check if we got any valid data
      if (!result.Make && !result.Model && !result.ModelYear) {
        if (isLikelyAustralian) {
          setVinDecodeError('Australian VIN detected. Some details may need to be entered manually. API coverage for Australian vehicles is limited.');
        } else {
          setVinDecodeError('Unable to decode VIN. Please enter details manually.');
        }
        setIsDecodingVIN(false);
        return;
      }

      // Map body type from API to our types
      const mapBodyType = (bodyClass: string): BodyType => {
        const bodyClassLower = (bodyClass || '').toLowerCase();
        if (bodyClassLower.includes('sedan')) return 'Sedan';
        if (bodyClassLower.includes('suv') || bodyClassLower.includes('sport utility')) return 'SUV';
        if (bodyClassLower.includes('coupe')) return 'Coupe';
        if (bodyClassLower.includes('hatchback')) return 'Hatchback';
        if (bodyClassLower.includes('wagon')) return 'Wagon';
        if (bodyClassLower.includes('convertible') || bodyClassLower.includes('cabriolet')) return 'Convertible';
        if (bodyClassLower.includes('pickup') || bodyClassLower.includes('truck')) return 'Pickup Truck';
        if (bodyClassLower.includes('van')) return 'Van';
        if (bodyClassLower.includes('ute')) return 'Ute';
        return 'Sedan'; // Default
      };

      // Update form with decoded data
      setFormData(prev => ({
        ...prev,
        make: result.Make || prev.make,
        model: result.Model || prev.model,
        year: result.ModelYear || prev.year,
        bodyType: result.BodyClass ? mapBodyType(result.BodyClass) : prev.bodyType,
      }));
      
      setVinDecodeSuccess(true);
      
      // Show which API was used
      console.log(`Successfully decoded using: ${apiUsed}`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setVinDecodeSuccess(false);
      }, 3000);
      
      // Store decoded information
      setDecodedInfo({ ...result, apiUsed });
    } catch (error) {
      console.error('VIN Decode Error:', error);
      setVinDecodeError('Network error. Please check your connection and try again.');
    } finally {
      setIsDecodingVIN(false);
    }
  };

  const scanVIN = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningVIN(true);
    setVinScanError('');

    try {
      let imageDataToProcess: string;

      // Check if the file is a PDF
      if (file.type === 'application/pdf') {
        // Configure PDF.js worker - use unpkg instead of cdnjs for better compatibility
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`;

        // Read PDF file
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          // Disable worker if there are issues
          useWorkerFetch: false,
          isEvalSupported: false,
        }).promise;
        
        // Get first page (VIN info is usually on first page)
        const page = await pdf.getPage(1);
        
        // Set scale for better quality
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        // Create canvas to render PDF page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page to canvas
        await page.render({
          canvasContext: context!,
          viewport: viewport
        }).promise;
        
        // Convert canvas to data URL
        imageDataToProcess = canvas.toDataURL('image/png');
      } else {
        // For image files, read as before
        imageDataToProcess = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      
      // Create worker for Tesseract OCR
      const worker = await createWorker('eng');
      
      // Perform OCR on the image
      const { data: { text } } = await worker.recognize(imageDataToProcess);
      
      console.log('OCR Result:', text);
      
      // Extract VIN from text (VIN is always 17 alphanumeric characters, no I, O, or Q)
      const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
      const matches = text.match(vinPattern);
      
      let extractedVIN = '';
      if (matches && matches.length > 0) {
        extractedVIN = matches[0].toUpperCase();
        setFormData(prev => ({ ...prev, vin: extractedVIN }));
        setVinScanError('');
      } else {
        setVinScanError('No VIN found in document. Please try taking a clearer photo or enter manually.');
        await worker.terminate();
        setIsScanningVIN(false);
        return;
      }

      // Extract additional information from the OCR text
      const extractedInfo: any = {};

      // Extract Year (4-digit number between 1900-2026)
      const yearPattern = /\b(19[0-9]{2}|20[0-2][0-9])\b/g;
      const yearMatches = text.match(yearPattern);
      if (yearMatches && yearMatches.length > 0) {
        // Get the most recent year found
        const years = yearMatches.map(y => parseInt(y)).sort((a, b) => b - a);
        extractedInfo.year = years[0].toString();
      }

      // Extract auction names
      const auctions = ['COPART', 'MANHEIM', 'IAAI', 'IAA', 'ADESA', 'PICKLES', 
                       'GRAYS', 'FOWLES', 'CARSALES', 'GRAYSONLINE',
                       'INSURANCE AUTO AUCTIONS', 'AUTO AUCTION', 'SALVAGE AUCTION'];
      
      const textUpper = text.toUpperCase();
      for (const auction of auctions) {
        if (textUpper.includes(auction)) {
          // Format auction name properly
          if (auction === 'IAA' || auction === 'IAAI') {
            extractedInfo.auction = 'IAAI';
          } else if (auction === 'INSURANCE AUTO AUCTIONS') {
            extractedInfo.auction = 'IAAI';
          } else {
            extractedInfo.auction = auction.charAt(0) + auction.slice(1).toLowerCase();
          }
          break;
        }
      }

      // Extract common car makes
      const makes = ['TOYOTA', 'HONDA', 'FORD', 'CHEVROLET', 'CHEVY', 'NISSAN', 'MAZDA', 'SUBARU', 
                     'BMW', 'MERCEDES', 'MERCEDES-BENZ', 'AUDI', 'VOLKSWAGEN', 'VW', 'HYUNDAI', 'KIA', 'LEXUS',
                     'ACURA', 'INFINITI', 'JEEP', 'RAM', 'DODGE', 'CHRYSLER', 'GMC', 'CADILLAC',
                     'BUICK', 'LINCOLN', 'VOLVO', 'PORSCHE', 'TESLA', 'MITSUBISHI', 'SUZUKI',
                     'ISUZU', 'LAND ROVER', 'RANGE ROVER', 'JAGUAR', 'MINI', 'FIAT', 'ALFA ROMEO',
                     'MASERATI', 'FERRARI', 'LAMBORGHINI', 'BENTLEY', 'ROLLS ROYCE', 'ROLLS-ROYCE', 'ASTON MARTIN',
                     'HOLDEN', 'PEUGEOT', 'RENAULT', 'CITROEN', 'SKODA', 'SEAT'];
      
      for (const make of makes) {
        if (textUpper.includes(make)) {
          extractedInfo.make = make.charAt(0) + make.slice(1).toLowerCase();
          if (make === 'CHEVY') extractedInfo.make = 'Chevrolet';
          if (make === 'VW') extractedInfo.make = 'Volkswagen';
          if (make === 'MERCEDES-BENZ') extractedInfo.make = 'Mercedes';
          if (make === 'ROLLS-ROYCE') extractedInfo.make = 'Rolls Royce';
          break;
        }
      }

      // Extract colors
      const colors = ['WHITE', 'BLACK', 'SILVER', 'GRAY', 'GREY', 'RED', 'BLUE', 'GREEN', 
                      'YELLOW', 'ORANGE', 'BROWN', 'BEIGE', 'TAN', 'GOLD', 'BRONZE',
                      'PURPLE', 'MAROON', 'NAVY', 'BURGUNDY', 'CHARCOAL', 'PEARL'];
      
      for (const color of colors) {
        if (textUpper.includes(color)) {
          extractedInfo.color = color.charAt(0) + color.slice(1).toLowerCase();
          if (color === 'GREY') extractedInfo.color = 'Gray';
          break;
        }
      }

      // Extract common model keywords - expanded list with more models
      const models = [
        // Toyota
        'CAMRY', 'COROLLA', 'RAV4', 'RAV-4', 'HIGHLANDER', 'TACOMA', 'TUNDRA', 'SIENNA',
        'PRIUS', 'YARIS', 'AVALON', 'SEQUOIA', '4RUNNER', 'LAND CRUISER', 'SUPRA',
        // Honda
        'CIVIC', 'ACCORD', 'CRV', 'CR-V', 'PILOT', 'ODYSSEY', 'RIDGELINE', 'FIT', 'HR-V', 'PASSPORT',
        // Ford
        'F150', 'F-150', 'F250', 'F-250', 'F350', 'F-350', 'MUSTANG', 'EXPLORER', 'ESCAPE', 'EDGE',
        'EXPEDITION', 'RANGER', 'BRONCO', 'FUSION', 'FOCUS', 'FIESTA',
        // Chevrolet
        'SILVERADO', 'MALIBU', 'EQUINOX', 'TAHOE', 'SUBURBAN', 'TRAVERSE', 'COLORADO',
        'CAMARO', 'CORVETTE', 'BLAZER', 'TRAX', 'IMPALA',
        // Nissan
        'ALTIMA', 'MAXIMA', 'ROGUE', 'SENTRA', 'PATHFINDER', 'FRONTIER', 'MURANO', 'VERSA', 'ARMADA',
        'TITAN', 'LEAF', 'GT-R', 'GTR', '370Z', '350Z',
        // Mazda
        'CX5', 'CX-5', 'CX9', 'CX-9', 'CX3', 'CX-3', 'MAZDA3', 'MAZDA6', 'MAZDA2', 'MX-5', 'MX5',
        // Subaru
        'OUTBACK', 'FORESTER', 'IMPREZA', 'LEGACY', 'CROSSTREK', 'ASCENT', 'WRX', 'BRZ',
        // BMW
        'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', '1 SERIES', '2 SERIES', '3 SERIES', '4 SERIES', 
        '5 SERIES', '6 SERIES', '7 SERIES', '8 SERIES', 'M3', 'M4', 'M5',
        // Mercedes
        'C-CLASS', 'E-CLASS', 'S-CLASS', 'GLE', 'GLC', 'GLA', 'GLB', 'GLS', 'A-CLASS', 'B-CLASS',
        'CLA', 'CLS', 'G-CLASS', 'AMG',
        // Audi
        'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'E-TRON',
        // Jeep
        'WRANGLER', 'GRAND CHEROKEE', 'CHEROKEE', 'GLADIATOR', 'COMPASS', 'RENEGADE',
        // Tesla
        'MODEL 3', 'MODEL S', 'MODEL X', 'MODEL Y',
        // Volkswagen
        'GOLF', 'JETTA', 'PASSAT', 'TIGUAN', 'ATLAS', 'BEETLE', 'GTI', 'TOUAREG',
        // Hyundai
        'ELANTRA', 'SONATA', 'SANTA FE', 'TUCSON', 'KONA', 'PALISADE', 'VENUE', 'IONIQ',
        // Kia
        'OPTIMA', 'FORTE', 'SORENTO', 'SPORTAGE', 'TELLURIDE', 'SOUL', 'RIO', 'STINGER',
        // Dodge
        'CHARGER', 'CHALLENGER', 'DURANGO', 'JOURNEY', 'GRAND CARAVAN', 'RAM 1500', 'RAM 2500',
        // Holden (Australian)
        'COMMODORE', 'CRUZE', 'ASTRA', 'TRAX', 'COLORADO', 'CAPTIVA',
      ];
      
      for (const model of models) {
        if (textUpper.includes(model)) {
          extractedInfo.model = model.split(' ').map(word => 
            word.charAt(0) + word.slice(1).toLowerCase()
          ).join(' ');
          // Fix special cases
          if (model.includes('-')) {
            extractedInfo.model = model.split('-').map(part => 
              part.charAt(0) + part.slice(1).toLowerCase()
            ).join('-');
          }
          break;
        }
      }

      // Extract odometer reading (look for patterns like "123,456 km" or "50000 miles")
      const odoPattern = /(\d{1,3}(?:,\d{3})*|\d+)\s*(km|miles|mi|kilometers|kms)/gi;
      const odoMatches = text.match(odoPattern);
      if (odoMatches && odoMatches.length > 0) {
        const odoText = odoMatches[0];
        const odoNumber = odoText.match(/\d+/g)?.join('');
        if (odoNumber) {
          extractedInfo.odometer = odoNumber;
        }
      }

      // Extract damage information
      const damageKeywords = ['FRONT END', 'REAR END', 'SIDE', 'MINOR', 'MAJOR', 'HAIL', 
                             'WATER', 'FLOOD', 'FIRE', 'MECHANICAL', 'COLLISION',
                             'LEFT FRONT', 'RIGHT FRONT', 'LEFT REAR', 'RIGHT REAR'];
      
      for (const damage of damageKeywords) {
        if (textUpper.includes(damage)) {
          if (!extractedInfo.damageCondition) {
            extractedInfo.damageCondition = damage.toLowerCase().split(' ').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ');
          } else {
            extractedInfo.damageCondition += ', ' + damage.toLowerCase().split(' ').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ');
          }
        }
      }

      // Extract purchase price from auction receipt
      // Prioritize "TOTAL" keyword and look for the largest/most relevant price
      const pricePattern = /\$?\s*(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/g;
      
      let extractedPrice = null;
      
      // First, try to find price specifically near "TOTAL" keyword (highest priority)
      const totalKeywords = ['TOTAL:', 'TOTAL', 'GRAND TOTAL', 'TOTAL AMOUNT', 'TOTAL PRICE'];
      
      for (const keyword of totalKeywords) {
        if (textUpper.includes(keyword)) {
          const keywordIndex = textUpper.indexOf(keyword);
          // Look after the keyword (next 150 characters) for the price
          const contextStart = keywordIndex;
          const contextEnd = Math.min(text.length, keywordIndex + keyword.length + 150);
          const context = text.substring(contextStart, contextEnd);
          
          // Find all prices in this context
          const pricesInContext = [...context.matchAll(pricePattern)];
          
          if (pricesInContext.length > 0) {
            // Get the largest price in this context (likely to be the total)
            let largestPrice = 0;
            let largestPriceStr = '';
            
            for (const match of pricesInContext) {
              const priceStr = match[1].replace(/,/g, '');
              const priceNum = parseFloat(priceStr);
              
              // Filter out small numbers and unrealistic prices
              if (priceNum >= 500 && priceNum <= 999999 && priceNum > largestPrice) {
                largestPrice = priceNum;
                largestPriceStr = priceStr;
              }
            }
            
            if (largestPriceStr) {
              extractedPrice = largestPriceStr;
              console.log(`Found TOTAL price: $${extractedPrice} near keyword "${keyword}"`);
              break;
            }
          }
        }
      }
      
      // If no TOTAL found, try other keywords
      if (!extractedPrice) {
        const otherKeywords = [
          'FINAL PRICE', 'PURCHASE PRICE', 'WINNING BID', 'SALE PRICE', 
          'BID AMOUNT', 'HIGH BID', 'SELLING PRICE', 'FINAL BID', 'HAMMER PRICE'
        ];
        
        for (const keyword of otherKeywords) {
          if (textUpper.includes(keyword)) {
            const keywordIndex = textUpper.indexOf(keyword);
            const contextStart = keywordIndex;
            const contextEnd = Math.min(text.length, keywordIndex + keyword.length + 100);
            const context = text.substring(contextStart, contextEnd);
            
            const pricesInContext = [...context.matchAll(pricePattern)];
            
            if (pricesInContext.length > 0) {
              // Get the first significant price
              for (const match of pricesInContext) {
                const priceStr = match[1].replace(/,/g, '');
                const priceNum = parseFloat(priceStr);
                
                if (priceNum >= 500 && priceNum <= 999999) {
                  extractedPrice = priceStr;
                  console.log(`Found price $${extractedPrice} near keyword "${keyword}"`);
                  break;
                }
              }
              
              if (extractedPrice) break;
            }
          }
        }
      }
      
      if (extractedPrice) {
        extractedInfo.purchasePrice = extractedPrice;
      }

      // Update form with all extracted information
      setFormData(prev => ({
        ...prev,
        vin: extractedVIN,
        year: extractedInfo.year || prev.year,
        make: extractedInfo.make || prev.make,
        model: extractedInfo.model || prev.model,
        color: extractedInfo.color || prev.color,
        odometer: extractedInfo.odometer || prev.odometer,
        auction: extractedInfo.auction || prev.auction,
        damageCondition: extractedInfo.damageCondition || prev.damageCondition,
        purchasePrice: extractedInfo.purchasePrice || prev.purchasePrice,
      }));

      // Show success message with what was found
      const foundItems = [];
      if (extractedVIN) foundItems.push('VIN');
      if (extractedInfo.year) foundItems.push('Year');
      if (extractedInfo.make) foundItems.push('Make');
      if (extractedInfo.model) foundItems.push('Model');
      if (extractedInfo.color) foundItems.push('Color');
      if (extractedInfo.odometer) foundItems.push('Odometer');
      if (extractedInfo.auction) foundItems.push('Auction');
      if (extractedInfo.damageCondition) foundItems.push('Damage');
      if (extractedInfo.purchasePrice) foundItems.push('Purchase Price');

      if (foundItems.length > 1) {
        setVinScanError('');
        // Show what was found
        console.log('Extracted from document:', foundItems.join(', '));
      }
      
      // Automatically decode the VIN
      await decodeVIN(extractedVIN);
      
      await worker.terminate();
    } catch (error) {
      console.error('VIN Scan Error:', error);
      setVinScanError('Error scanning document. Please try again or enter manually.');
    } finally {
      setIsScanningVIN(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl">Add Vehicle</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Images */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-xl mb-4">Vehicle Photos</h2>
            
            <div className="mb-4">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-muted-foreground cursor-pointer transition-colors bg-background">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">Tap to add photos</span>
                </div>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image}
                      alt={`Vehicle ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-xl mb-4">Vehicle Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">VIN *</label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="1HGBH41JXMN109186"
                  required
                />
                <button
                  type="button"
                  onClick={() => decodeVIN(formData.vin)}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={isDecodingVIN}
                >
                  {isDecodingVIN ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Decoding VIN...
                    </>
                  ) : (
                    <>
                      🔍 Decode VIN
                    </>
                  )}
                </button>
                <label className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={scanVIN}
                    className="hidden"
                    disabled={isScanningVIN}
                  />
                  {isScanningVIN ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Scanning VIN...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      📸 Scan VIN from Photo/PDF
                    </>
                  )}
                </label>
                {vinDecodeError && (
                  <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-red-400 text-sm">{vinDecodeError}</p>
                  </div>
                )}
                {vinDecodeSuccess && (
                  <div className="mt-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                      ✅ VIN decoded successfully! Vehicle details have been auto-filled.
                    </p>
                  </div>
                )}
                {vinScanError && (
                  <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-red-400 text-sm">{vinScanError}</p>
                  </div>
                )}
              </div>

              {/* Decoded Vehicle Information Display */}
              {decodedInfo && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-blue-400 mb-3">📋 Decoded Vehicle Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {decodedInfo.Make && (
                      <div>
                        <span className="text-muted-foreground">Make:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.Make}</span>
                      </div>
                    )}
                    {decodedInfo.Model && (
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.Model}</span>
                      </div>
                    )}
                    {decodedInfo.ModelYear && (
                      <div>
                        <span className="text-muted-foreground">Year:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.ModelYear}</span>
                      </div>
                    )}
                    {decodedInfo.BodyClass && (
                      <div>
                        <span className="text-muted-foreground">Body Type:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.BodyClass}</span>
                      </div>
                    )}
                    {decodedInfo.Trim && decodedInfo.Trim !== 'Not Applicable' && (
                      <div>
                        <span className="text-muted-foreground">Trim:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.Trim}</span>
                      </div>
                    )}
                    {decodedInfo.EngineModel && (
                      <div>
                        <span className="text-muted-foreground">Engine:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.EngineModel}</span>
                      </div>
                    )}
                    {decodedInfo.EngineCylinders && (
                      <div>
                        <span className="text-muted-foreground">Cylinders:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.EngineCylinders}</span>
                      </div>
                    )}
                    {decodedInfo.DisplacementL && (
                      <div>
                        <span className="text-muted-foreground">Displacement:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.DisplacementL}L</span>
                      </div>
                    )}
                    {decodedInfo.TransmissionStyle && (
                      <div>
                        <span className="text-muted-foreground">Transmission:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.TransmissionStyle}</span>
                      </div>
                    )}
                    {decodedInfo.DriveType && (
                      <div>
                        <span className="text-muted-foreground">Drive Type:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.DriveType}</span>
                      </div>
                    )}
                    {decodedInfo.FuelTypePrimary && (
                      <div>
                        <span className="text-muted-foreground">Fuel Type:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.FuelTypePrimary}</span>
                      </div>
                    )}
                    {decodedInfo.Doors && (
                      <div>
                        <span className="text-muted-foreground">Doors:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.Doors}</span>
                      </div>
                    )}
                    {decodedInfo.PlantCountry && (
                      <div>
                        <span className="text-muted-foreground">Made In:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.PlantCountry}</span>
                      </div>
                    )}
                    {decodedInfo.Manufacturer && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Manufacturer:</span>
                        <span className="ml-2 text-foreground font-medium">{decodedInfo.Manufacturer}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground italic">
                    ℹ️ Note: Color, odometer, and pricing must be entered manually as they are not included in VIN data.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Make *</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Camry"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Year *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="2020"
                    min="1900"
                    max="2026"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Odometer (km) *</label>
                  <input
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Auction *</label>
                  <input
                    type="text"
                    value={formData.auction}
                    onChange={(e) => setFormData({ ...formData, auction: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="Copart, Manheim, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Purchase Date *</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Color (Optional)</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Red, Blue, Black"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Body Type (Optional)</label>
                  <select
                    value={formData.bodyType}
                    onChange={(e) => setFormData({ ...formData, bodyType: e.target.value as BodyType })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Wagon">Wagon</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Vehicle Name (Optional)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., John's Car, Red Camry, Project BMW"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  required
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Damage Condition (Optional)</label>
                <input
                  type="text"
                  value={formData.damageCondition}
                  onChange={(e) => setFormData({ ...formData, damageCondition: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Minor dents, major scratches"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-xl mb-4">Financial Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Purchase Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="15000.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Transport Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.transportCost}
                  onChange={(e) => setFormData({ ...formData, transportCost: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="300.00"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Estimated Sale Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedSalePrice}
                  onChange={(e) => setFormData({ ...formData, estimatedSalePrice: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="22000.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl transition-colors text-lg"
          >
            Add Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}