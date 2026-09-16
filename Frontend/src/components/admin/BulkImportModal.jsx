import React, { useState, useRef, useMemo } from "react";
import {
  X,
  Download,
  UploadCloud,
  FileSpreadsheet,
  Images,
  AlertCircle,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  Eye,
  Check,
  PackagePlus,
  FileText
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { bulkImportProducts } from "../../api/productApi";

const DEFAULT_CATEGORIES = [
  "FLOUR",
  "NOODLES",
  "RAVA",
  "VERMICELLI",
  "MILLETS",
  "Millet Products",
  "INSTANT PRODUCTS",
  "spices",
  "pickles",
  "Maida",
  "Sooji"
];

const BulkImportModal = ({
  isOpen,
  onClose,
  onImportSuccess,
  availableCategories = []
}) => {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'preview'
  const [parsedRows, setParsedRows] = useState([]);
  const [uploadedImages, setUploadedImages] = useState({}); // { [filenameLower]: { file, previewUrl, base64 } }
  const [spreadsheetFileName, setSpreadsheetFileName] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const combinedCategories = useMemo(() => {
    const set = new Set([...DEFAULT_CATEGORIES, ...availableCategories.filter(Boolean)]);
    return Array.from(set);
  }, [availableCategories]);

  // --- VALIDATION STATS ---
  const stats = useMemo(() => {
    let validCount = 0;
    let invalidCount = 0;
    let imagesMatchedCount = 0;

    parsedRows.forEach((row) => {
      const isValid = row.name.trim() !== "" && row.price > 0;
      if (isValid) validCount++;
      else invalidCount++;

      if (
        row.matchedImage ||
        (row.imageRef && (row.imageRef.startsWith("http") || row.imageRef.startsWith("data:")))
      ) {
        imagesMatchedCount++;
      }
    });

    return {
      total: parsedRows.length,
      valid: validCount,
      invalid: invalidCount,
      imagesMatched: imagesMatchedCount
    };
  }, [parsedRows]);

  // --- TEMPLATE DOWNLOADERS ---
  const handleDownloadTemplate = (format = "xlsx") => {
    try {
      const sampleData = [
        {
          Name: "Roasted Vermicelli 500g",
          Category: "VERMICELLI",
          Price: 45,
          Stock: 50,
          LowStockThreshold: 10,
          InStock: "TRUE",
          Description: "Traditional roasted vermicelli made with high quality wheat for sweet and savory dishes.",
          ImageURL_or_FileName: "roasted_vermicelli.jpg"
        },
        {
          Name: "Finger Millet (Ragi) Noodles 200g",
          Category: "NOODLES",
          Price: 65,
          Stock: 40,
          LowStockThreshold: 8,
          InStock: "TRUE",
          Description: "Healthy millet noodles enriched with natural iron, dietary fiber and tastemaker mix.",
          ImageURL_or_FileName: "millet_noodles.jpg"
        },
        {
          Name: "Pure Stone-Ground Ragi Flour 1kg",
          Category: "FLOUR",
          Price: 80,
          Stock: 30,
          LowStockThreshold: 5,
          InStock: "TRUE",
          Description: "100% whole grain stone-ground ragi flour packed with natural calcium.",
          ImageURL_or_FileName: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600"
        },
        {
          Name: "Premium Bombay Sooji 1kg",
          Category: "RAVA",
          Price: 70,
          Stock: 25,
          LowStockThreshold: 5,
          InStock: "TRUE",
          Description: "Finest quality wheat rava for golden upma, kesari and authentic South Indian breakfast.",
          ImageURL_or_FileName: "bombay_rava.png"
        }
      ];

      const categoryGuideData = combinedCategories.map((cat) => ({
        "Available Categories": cat,
        "Notes": "Copy and paste into the Category column"
      }));

      const wb = XLSX.utils.book_new();

      // Sheet 1: Products
      const wsProducts = XLSX.utils.json_to_sheet(sampleData);
      wsProducts["!cols"] = [
        { wch: 35 }, // Name
        { wch: 20 }, // Category
        { wch: 12 }, // Price
        { wch: 12 }, // Stock
        { wch: 18 }, // LowStockThreshold
        { wch: 12 }, // InStock
        { wch: 50 }, // Description
        { wch: 35 }, // ImageURL_or_FileName
      ];
      XLSX.utils.book_append_sheet(wb, wsProducts, "Products");

      // Sheet 2: Category Guide
      const wsCategories = XLSX.utils.json_to_sheet(categoryGuideData);
      wsCategories["!cols"] = [{ wch: 25 }, { wch: 45 }];
      XLSX.utils.book_append_sheet(wb, wsCategories, "Category Guide");

      if (format === "xlsx") {
        XLSX.writeFile(wb, "Sowmiya_Foods_Bulk_Import_Template.xlsx");
        toast.success("Excel template downloaded successfully!");
      } else {
        XLSX.writeFile(wb, "Sowmiya_Foods_Bulk_Import_Template.csv");
        toast.success("CSV template downloaded successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate template");
    }
  };

  // --- SPREADSHEET PARSING ---
  const handleSpreadsheetUpload = (file) => {
    if (!file) return;
    setIsProcessingFile(true);
    setSpreadsheetFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          toast.error("The uploaded file is empty");
          setIsProcessingFile(false);
          return;
        }

        // Standardize column keys (lowercase, trimmed, strip underscores/spaces)
        const parsed = rawJson.map((row, index) => {
          const normalized = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.trim().toLowerCase().replace(/[\s_-]+/g, "");
            normalized[cleanKey] = row[key];
          });

          const name = (
            normalized["name"] ||
            normalized["productname"] ||
            normalized["title"] ||
            ""
          ).toString().trim();

          const category = (
            normalized["category"] ||
            normalized["cat"] ||
            "FLOUR"
          ).toString().trim();

          const price = parseFloat(normalized["price"] || normalized["productprice"] || 0);

          const stockRaw = normalized["stock"] || normalized["quantity"] || normalized["inventory"] || 20;
          const stock = isNaN(parseInt(stockRaw, 10)) ? 20 : parseInt(stockRaw, 10);

          const lowStockThresholdRaw = normalized["lowstockthreshold"] || normalized["threshold"] || 10;
          const lowStockThreshold = isNaN(parseInt(lowStockThresholdRaw, 10))
            ? 10
            : parseInt(lowStockThresholdRaw, 10);

          const inStockVal = normalized["instock"];
          const inStock =
            inStockVal === undefined || inStockVal === "" || inStockVal === true ||
            inStockVal?.toString().toLowerCase() === "true" ||
            inStockVal?.toString().toLowerCase() === "yes" ||
            inStockVal === 1;

          const description = (
            normalized["description"] ||
            normalized["desc"] ||
            ""
          ).toString().trim();

          const imageRef = (
            normalized["imageurlorfilename"] ||
            normalized["image"] ||
            normalized["imageurl"] ||
            normalized["filename"] ||
            ""
          ).toString().trim();

          return {
            id: `row-${index + 1}-${Date.now()}`,
            name,
            category,
            price: isNaN(price) ? 0 : price,
            stock,
            lowStockThreshold,
            inStock,
            description,
            imageRef, // stores initial filename or url
            matchedImage: null // will be populated from uploaded images if matching
          };
        });

        // Auto-match images if user had already uploaded some
        const updatedRows = matchImagesToRows(parsed, uploadedImages);
        setParsedRows(updatedRows);
        setActiveTab("preview");
        toast.success(`Parsed ${parsed.length} products from ${file.name}`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse spreadsheet. Please check format.");
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.onerror = () => {
      toast.error("Error reading spreadsheet file");
      setIsProcessingFile(false);
    };
    reader.readAsArrayBuffer(file);
  };

  // --- MULTI-IMAGE UPLOAD & MATCHING ---
  const handleImagesUpload = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const newImagesMap = { ...uploadedImages };

    toast.loading(`Processing ${fileList.length} image(s)...`, { id: "img-loader" });

    const readPromises = fileList.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result;
          const cleanName = file.name.trim().toLowerCase();
          const baseNameNoExt = cleanName.replace(/\.[^/.]+$/, "");

          newImagesMap[cleanName] = {
            file,
            previewUrl: URL.createObjectURL(file),
            base64,
            originalName: file.name
          };

          // Also store without extension for lenient matching
          if (!newImagesMap[baseNameNoExt]) {
            newImagesMap[baseNameNoExt] = newImagesMap[cleanName];
          }

          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
      });
    });

    await Promise.all(readPromises);
    setUploadedImages(newImagesMap);
    toast.dismiss("img-loader");
    toast.success(`Added ${fileList.length} local images! Matching with products...`);

    // Match with existing parsed rows
    if (parsedRows.length > 0) {
      setParsedRows((prev) => matchImagesToRows(prev, newImagesMap));
    }
  };

  const matchImagesToRows = (rows, imagesMap) => {
    return rows.map((row) => {
      const ref = (row.imageRef || "").trim();
      if (!ref) {
        // Try matching by sanitized product name if no imageRef specified
        const sanitizedName = row.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        if (imagesMap[sanitizedName]) {
          return { ...row, matchedImage: imagesMap[sanitizedName] };
        }
        return row;
      }

      // If already a full URL (http/https), it's self-contained
      if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:image")) {
        return {
          ...row,
          matchedImage: { previewUrl: ref, base64: ref, originalName: ref }
        };
      }

      // Check in uploaded images map (exact filename or without extension)
      const cleanRef = ref.toLowerCase();
      const cleanRefNoExt = cleanRef.replace(/\.[^/.]+$/, "");

      if (imagesMap[cleanRef]) {
        return { ...row, matchedImage: imagesMap[cleanRef] };
      } else if (imagesMap[cleanRefNoExt]) {
        return { ...row, matchedImage: imagesMap[cleanRefNoExt] };
      }

      return { ...row, matchedImage: null };
    });
  };

  // --- EDITING PREVIEW ROWS ---
  const handleUpdateRow = (id, field, value) => {
    setParsedRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDeleteRow = (id) => {
    setParsedRows((prev) => prev.filter((row) => row.id !== id));
    toast.success("Product removed from import queue");
  };

  // --- EXECUTE IMPORT ---
  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) {
      toast.error("No products loaded to import");
      return;
    }

    const invalidRows = parsedRows.filter((r) => !r.name.trim() || r.price <= 0);
    if (invalidRows.length > 0) {
      const proceed = window.confirm(
        `There are ${invalidRows.length} product(s) with missing name or zero price that will be skipped. Do you wish to continue with valid products?`
      );
      if (!proceed) return;
    }

    const payload = parsedRows
      .filter((r) => r.name.trim() && r.price > 0)
      .map((r) => ({
        name: r.name.trim(),
        category: r.category || "FLOUR",
        price: Number(r.price),
        stock: Number(r.stock) || 20,
        lowStockThreshold: Number(r.lowStockThreshold) || 10,
        inStock: r.inStock !== false,
        description: r.description || "",
        image: r.matchedImage?.base64 || r.matchedImage?.previewUrl || r.imageRef || ""
      }));

    if (payload.length === 0) {
      toast.error("No valid products to import");
      return;
    }

    setIsImporting(true);
    setImportProgress("Uploading products and processing images...");

    try {
      const res = await bulkImportProducts(payload);
      toast.success(res.message || `Successfully imported ${res.count || payload.length} products!`);
      if (onImportSuccess) {
        onImportSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to bulk import products. Check server logs.");
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  const handleReset = () => {
    setParsedRows([]);
    setSpreadsheetFileName("");
    setUploadedImages({});
    setActiveTab("upload");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={isImporting ? undefined : onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50/50 via-white to-orange-50/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8703b]/10 text-[#e8703b] flex items-center justify-center font-bold">
                <PackagePlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bulk Product Import
                </h2>
                <p className="text-xs text-slate-500">
                  Upload spreadsheets & product photos to populate inventory in seconds
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isImporting}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/60 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "upload"
                    ? "bg-white text-[#e8703b] shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>1. Upload & Template</span>
              </button>

              <button
                onClick={() => {
                  if (parsedRows.length > 0) setActiveTab("preview");
                  else toast("Please upload a spreadsheet first to preview data", { icon: "ℹ️" });
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-white text-[#e8703b] shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>2. Preview & Validation</span>
                {parsedRows.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[#e8703b]/10 text-[#e8703b] font-bold">
                    {parsedRows.length}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Template Download Pills */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-medium">Need sample format?</span>
              <button
                onClick={() => handleDownloadTemplate("xlsx")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition cursor-pointer"
                title="Download formatted Excel spreadsheet template with examples"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>.XLSX Template</span>
              </button>
              <button
                onClick={() => handleDownloadTemplate("csv")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                title="Download CSV spreadsheet template with examples"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>.CSV Template</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "upload" ? (
              <div className="space-y-6">
                {/* Banner: Template Download */}
                <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-orange-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e8703b] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Download Pre-Formatted Excel Template First
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Includes valid headers (<code className="bg-orange-100/70 px-1 py-0.5 rounded text-orange-900 font-mono text-[11px]">Name, Category, Price, Stock, Description, ImageURL_or_FileName</code>) and sample products.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => handleDownloadTemplate("xlsx")}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Download .XLSX</span>
                    </button>
                    <button
                      onClick={() => handleDownloadTemplate("csv")}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .CSV</span>
                    </button>
                  </div>
                </div>

                {/* Upload Zones Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Zone 1: Spreadsheet File */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#e8703b]/60 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1</span>
                        <span className="text-[11px] font-semibold text-[#e8703b] bg-orange-50 px-2 py-0.5 rounded-full">Required</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#e8703b] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Upload Excel or CSV File
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Select or drag your filled spreadsheet (.xlsx, .xls, .csv).
                      </p>

                      {spreadsheetFileName ? (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-semibold text-emerald-900 truncate">
                              {spreadsheetFileName}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            {parsedRows.length} Rows
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleSpreadsheetUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingFile}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isProcessingFile ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Reading Spreadsheet...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            <span>{spreadsheetFileName ? "Replace Spreadsheet" : "Browse Spreadsheet"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Zone 2: Bulk Product Images */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#e8703b]/60 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 2</span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Optional</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                        <Images className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Bulk Upload Local Product Images
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Select multiple image files (<code className="text-slate-600 font-mono text-[10px]">.jpg, .png, .webp</code>). Auto-matched to rows where filename matches column.
                      </p>

                      {Object.keys(uploadedImages).length > 0 ? (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="text-xs font-semibold text-blue-900">
                              {Object.keys(uploadedImages).length} Image files loaded
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                            Ready
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleImagesUpload(e.target.files);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Images className="w-4 h-4 text-blue-600" />
                        <span>
                          {Object.keys(uploadedImages).length > 0 ? "Add More Images" : "Select Product Images"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions & Category Reference */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                    <HelpCircle className="w-4 h-4 text-[#e8703b]" />
                    <span>How Image Matching & Categories Work</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
                    <li>
                      <strong>Direct Web URLs:</strong> You can paste direct image URLs (e.g. <code className="text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200 text-[10px]">https://example.com/image.jpg</code>) in the spreadsheet column.
                    </li>
                    <li>
                      <strong>Local Image Files:</strong> Write the filename (e.g. <code className="text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200 text-[10px]">vermicelli.jpg</code>) in the spreadsheet, then drag your images into Step 2. They will automatically link together!
                    </li>
                    <li>
                      <strong>Valid Categories:</strong>{" "}
                      {combinedCategories.map((c, i) => (
                        <span key={c} className="inline-block bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 text-[11px] font-medium mr-1.5 my-0.5">
                          {c}
                        </span>
                      ))}
                    </li>
                  </ul>
                </div>

                {/* Bottom navigation */}
                {parsedRows.length > 0 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs text-slate-500 hover:text-rose-600 underline cursor-pointer"
                    >
                      Clear & Start Over
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] shadow-md shadow-orange-500/20 transition cursor-pointer"
                    >
                      <span>Proceed to Preview ({parsedRows.length} items)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* TAB 2: PREVIEW & VALIDATION */
              <div className="space-y-4">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Items</span>
                    <p className="text-lg font-bold text-slate-800">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase">Ready To Import</span>
                    <p className="text-lg font-bold text-emerald-700">{stats.valid}</p>
                  </div>
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
                    <span className="text-[11px] font-semibold text-amber-600 uppercase">Images Matched</span>
                    <p className="text-lg font-bold text-amber-700">{stats.imagesMatched}</p>
                  </div>
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80">
                    <span className="text-[11px] font-semibold text-rose-600 uppercase">Validation Warnings</span>
                    <p className="text-lg font-bold text-rose-700">{stats.invalid}</p>
                  </div>
                </div>

                {stats.invalid > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {stats.invalid} item(s) have missing names or invalid prices (≤ 0). You can edit them directly in the table below or delete them.
                    </span>
                  </div>
                )}

                {/* Table Container */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="max-h-[45vh] overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Image</th>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Price (₹)</th>
                          <th className="py-2.5 px-3">Stock</th>
                          <th className="py-2.5 px-3">In Stock?</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.map((row, idx) => {
                          const isValid = row.name.trim() !== "" && row.price > 0;
                          const imageSrc =
                            row.matchedImage?.previewUrl ||
                            (row.imageRef?.startsWith("http") ? row.imageRef : null);

                          return (
                            <tr
                              key={row.id}
                              className={`hover:bg-slate-50/80 transition ${
                                !isValid ? "bg-rose-50/30" : ""
                              }`}
                            >
                              {/* Status */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {isValid ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" />
                                    <span>Ready</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Fix</span>
                                  </span>
                                )}
                              </td>

                              {/* Image Thumbnail */}
                              <td className="py-2.5 px-3">
                                <div className="relative w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                  {imageSrc ? (
                                    <img
                                      src={imageSrc}
                                      alt={row.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[9px] text-slate-400 text-center font-medium leading-tight">
                                      No img
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Name */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => handleUpdateRow(row.id, "name", e.target.value)}
                                  placeholder="Product Name"
                                  className={`w-full min-w-[160px] px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#e8703b] ${
                                    !row.name.trim()
                                      ? "border-rose-400 bg-rose-50 text-rose-900"
                                      : "border-slate-200 bg-white"
                                  }`}
                                />
                              </td>

                              {/* Category */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={row.category}
                                  onChange={(e) => handleUpdateRow(row.id, "category", e.target.value)}
                                  className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#e8703b]"
                                >
                                  {combinedCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Price */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  value={row.price}
                                  onChange={(e) =>
                                    handleUpdateRow(row.id, "price", parseFloat(e.target.value) || 0)
                                  }
                                  className={`w-20 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#e8703b] ${
                                    row.price <= 0
                                      ? "border-rose-400 bg-rose-50 text-rose-900"
                                      : "border-slate-200 bg-white"
                                  }`}
                                />
                              </td>

                              {/* Stock */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  value={row.stock}
                                  onChange={(e) =>
                                    handleUpdateRow(row.id, "stock", parseInt(e.target.value, 10) || 0)
                                  }
                                  className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#e8703b]"
                                />
                              </td>

                              {/* In Stock */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={row.inStock}
                                  onChange={(e) => handleUpdateRow(row.id, "inStock", e.target.checked)}
                                  className="w-4 h-4 rounded text-[#e8703b] focus:ring-[#e8703b] accent-[#e8703b] cursor-pointer"
                                />
                              </td>

                              {/* Delete Action */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(row.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                  title="Remove from import"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              {activeTab === "preview" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  disabled={isImporting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition cursor-pointer disabled:opacity-50"
                >
                  ← Back to Upload
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isImporting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              {parsedRows.length > 0 && (
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={isImporting || stats.valid === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{importProgress || "Importing Products..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Import ({stats.valid} Products)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
