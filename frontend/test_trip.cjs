var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/pages/TripCostCalculator.jsx
var TripCostCalculator_exports = {};
__export(TripCostCalculator_exports, {
  default: () => TripCostCalculator
});
module.exports = __toCommonJS(TripCostCalculator_exports);
var import_react = __toESM(require("react"), 1);
var import_api = require("../services/api.js");
var import_useCurrency = require("../hooks/useCurrency.js");
var import_lucide_react = require("lucide-react");
function TripCostCalculator() {
  const { symbol, convertFromUSD, formatPrice, currency: userCurrency } = (0, import_useCurrency.useCurrency)();
  const [hotels, setHotels] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
  const [selectedHotelId, setSelectedHotelId] = (0, import_react.useState)("");
  const [selectedRoomId, setSelectedRoomId] = (0, import_react.useState)("");
  const [checkIn, setCheckIn] = (0, import_react.useState)("");
  const [checkOut, setCheckOut] = (0, import_react.useState)("");
  const [adults, setAdults] = (0, import_react.useState)(1);
  const [children, setChildren] = (0, import_react.useState)(0);
  const [numRooms, setNumRooms] = (0, import_react.useState)(1);
  const [activitiesCost, setActivitiesCost] = (0, import_react.useState)(0);
  const [otherCost, setOtherCost] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    fetchHotels();
  }, []);
  const fetchHotels = async () => {
    try {
      const res = await import_api.hotelService.getAll();
      if (res.success && res.data) {
        setHotels(res.data);
      }
    } catch (err) {
      console.error("Error fetching hotels for calculator:", err);
    } finally {
      setLoading(false);
    }
  };
  const selectedHotel = hotels.find((h) => h.id === Number(selectedHotelId));
  const roomsForHotel = selectedHotel?.rooms || [];
  const selectedRoom = roomsForHotel.find((r) => r.id === Number(selectedRoomId));
  (0, import_react.useEffect)(() => {
    if (roomsForHotel.length > 0 && !roomsForHotel.find((r) => r.id === Number(selectedRoomId))) {
      setSelectedRoomId("");
    }
  }, [selectedHotelId]);
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end - start;
    const nights2 = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    return nights2 > 0 ? nights2 : 0;
  };
  const nights = calculateNights();
  const totalGuests = Number(adults) + Number(children);
  const roomPricePerNight = selectedRoom ? Number(selectedRoom.price_per_night) : 0;
  const hotelCostInUserCurrency = convertFromUSD(roomPricePerNight, userCurrency) * Number(numRooms) * nights;
  const tripDays = nights > 0 ? nights + 1 : 0;
  const cityAvgFood = selectedHotel?.city?.avg_daily_food_cost ? Number(selectedHotel.city.avg_daily_food_cost) : null;
  const cityAvgTransport = selectedHotel?.city?.avg_daily_transport_cost ? Number(selectedHotel.city.avg_daily_transport_cost) : null;
  const foodCostInUserCurrency = cityAvgFood !== null ? convertFromUSD(cityAvgFood, userCurrency) * totalGuests * tripDays : 0;
  const transportInUserCurrency = cityAvgTransport !== null ? convertFromUSD(cityAvgTransport, userCurrency) * totalGuests * tripDays : 0;
  const activitiesInUserCurrency = Number(activitiesCost) || 0;
  const otherInUserCurrency = Number(otherCost) || 0;
  const totalCost = hotelCostInUserCurrency + foodCostInUserCurrency + transportInUserCurrency + activitiesInUserCurrency + otherInUserCurrency;
  const getValidationError = () => {
    if (selectedHotelId && !selectedRoomId) return "Please select a room type.";
    if (checkIn && checkOut && nights <= 0) return "Check-out must be after check-in date.";
    if (adults < 1) return "At least 1 adult is required.";
    if (numRooms < 1) return "At least 1 room is required.";
    if (activitiesCost < 0 || otherCost < 0) return "Costs cannot be negative.";
    return null;
  };
  const validationError = getValidationError();
  const isValid = !validationError && selectedHotelId && selectedRoomId && nights > 0;
  const handleReset = () => {
    setSearchQuery("");
    setSelectedHotelId("");
    setSelectedRoomId("");
    setCheckIn("");
    setCheckOut("");
    setAdults(1);
    setChildren(0);
    setNumRooms(1);
    setActivitiesCost(0);
    setOtherCost(0);
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen py-10" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "mb-8 border-b border-slate-200 dark:border-slate-800 pb-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-3 mb-2" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400" }, /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Calculator, { className: "w-5 h-5" })), /* @__PURE__ */ import_react.default.createElement("h1", { className: "text-2xl font-bold text-slate-900 dark:text-white" }, "Trip Cost Calculator")), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-slate-500 dark:text-slate-400 text-sm" }, "Estimate the total expenses for your upcoming trip including stay, food, transport, and activities.")), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "lg:col-span-2 space-y-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white dark:bg-dark-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Hotel, { className: "w-4 h-4 text-brand-500" }), " Accommodation"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300" }, "Select Hotel"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      list: "hotel-list",
      type: "text",
      placeholder: loading ? "Loading hotels..." : "Search for a hotel...",
      value: searchQuery,
      onChange: (e) => {
        setSearchQuery(e.target.value);
        const match = hotels.find((h) => h.name === e.target.value);
        setSelectedHotelId(match ? match.id : "");
      },
      className: "w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none",
      disabled: loading
    }
  ), /* @__PURE__ */ import_react.default.createElement("datalist", { id: "hotel-list" }, hotels.map((h) => /* @__PURE__ */ import_react.default.createElement("option", { key: h.id, value: h.name })))), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300" }, "Room Type"), /* @__PURE__ */ import_react.default.createElement(
    "select",
    {
      value: selectedRoomId,
      onChange: (e) => setSelectedRoomId(e.target.value),
      className: "w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none",
      disabled: !selectedHotelId || roomsForHotel.length === 0
    },
    /* @__PURE__ */ import_react.default.createElement("option", { value: "" }, "-- Choose a Room --"),
    roomsForHotel.map((r) => /* @__PURE__ */ import_react.default.createElement("option", { key: r.id, value: r.id }, r.room_type, " - ", symbol, formatPrice(r.price_per_night), "/night"))
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300" }, "Check-in Date"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "date",
      value: checkIn,
      onChange: (e) => setCheckIn(e.target.value),
      className: "w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
    }
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300" }, "Check-out Date"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "date",
      value: checkOut,
      onChange: (e) => setCheckOut(e.target.value),
      className: "w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
    }
  )))), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white dark:bg-dark-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Users, { className: "w-4 h-4 text-brand-500" }), " Guests & Rooms"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300" }, "Rooms"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "number",
      min: "1",
      value: numRooms,
      onChange: (e) => setNumRooms(e.target.value),
      className: "w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
    }
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300" }, "Adults"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "number",
      min: "1",
      value: adults,
      onChange: (e) => setAdults(e.target.value),
      className: "w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
    }
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300" }, "Children"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "number",
      min: "0",
      value: children,
      onChange: (e) => setChildren(e.target.value),
      className: "w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
    }
  )))), /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white dark:bg-dark-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(import_lucide_react.CreditCard, { className: "w-4 h-4 text-brand-500" }), " Additional Expenses (", symbol, ")"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1" }, /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Car, { className: "w-3 h-3" }), " Daily Transport (per person)"), /* @__PURE__ */ import_react.default.createElement("div", { className: "w-full bg-slate-100 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed" }, selectedHotelId && cityAvgTransport !== null ? `${symbol}${convertFromUSD(cityAvgTransport, userCurrency).toFixed(0)} (City Avg)` : selectedHotelId ? "No data available" : "Select a hotel first")), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1" }, /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Coffee, { className: "w-3 h-3" }), " Daily Food (per person)"), /* @__PURE__ */ import_react.default.createElement("div", { className: "w-full bg-slate-100 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed" }, selectedHotelId && cityAvgFood !== null ? `${symbol}${convertFromUSD(cityAvgFood, userCurrency).toFixed(0)} (City Avg)` : selectedHotelId ? "No data available" : "Select a hotel first")), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1" }, /* @__PURE__ */ import_react.default.createElement(import_lucide_react.MapPin, { className: "w-3 h-3" }), " Activities"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "number",
      min: "0",
      value: activitiesCost,
      onChange: (e) => setActivitiesCost(e.target.value),
      className: "w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
    }
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1" }, /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Banknote, { className: "w-3 h-3" }), " Other"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "number",
      min: "0",
      value: otherCost,
      onChange: (e) => setOtherCost(e.target.value),
      className: "w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
    }
  ))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "lg:col-span-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-white dark:bg-dark-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-28" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4" }, "Estimated Total Cost"), validationError && /* @__PURE__ */ import_react.default.createElement("div", { className: "mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium" }, validationError), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-4 mb-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-between items-center text-sm" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-slate-600 dark:text-slate-400" }, "Hotel (", nights, " nights \xD7 ", numRooms, " room)"), /* @__PURE__ */ import_react.default.createElement("span", { className: "font-semibold text-slate-800 dark:text-slate-200" }, symbol, hotelCostInUserCurrency.toFixed(0))), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-between items-center text-sm" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-slate-600 dark:text-slate-400" }, "Food (", tripDays, " days \xD7 ", totalGuests, " guests)"), /* @__PURE__ */ import_react.default.createElement("span", { className: "font-semibold text-slate-800 dark:text-slate-200" }, symbol, foodCostInUserCurrency.toFixed(0))), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-between items-center text-sm" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-slate-600 dark:text-slate-400" }, "Transportation"), /* @__PURE__ */ import_react.default.createElement("span", { className: "font-semibold text-slate-800 dark:text-slate-200" }, symbol, transportInUserCurrency.toFixed(0))), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-between items-center text-sm" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-slate-600 dark:text-slate-400" }, "Activities"), /* @__PURE__ */ import_react.default.createElement("span", { className: "font-semibold text-slate-800 dark:text-slate-200" }, symbol, activitiesInUserCurrency.toFixed(0))), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-between items-center text-sm" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-slate-600 dark:text-slate-400" }, "Other Expenses"), /* @__PURE__ */ import_react.default.createElement("span", { className: "font-semibold text-slate-800 dark:text-slate-200" }, symbol, otherInUserCurrency.toFixed(0)))), /* @__PURE__ */ import_react.default.createElement("div", { className: "pt-4 border-t border-slate-100 dark:border-slate-800 mb-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-base font-bold text-slate-800 dark:text-slate-200" }, "Total Trip Cost"), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-2xl font-black text-brand-600 dark:text-brand-400" }, symbol, isValid ? totalCost.toFixed(0) : 0))), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type: "button",
      onClick: handleReset,
      className: "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
    },
    /* @__PURE__ */ import_react.default.createElement(import_lucide_react.RotateCcw, { className: "w-4 h-4" }),
    " Reset"
  ), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type: "button",
      disabled: !isValid,
      className: `py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors text-white
                    ${isValid ? "bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500" : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50"}
                  `
    },
    "Calculate"
  )))))));
}
