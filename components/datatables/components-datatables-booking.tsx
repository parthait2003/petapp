"use client";

import { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css"; // Import Flatpickr styles
import {
  FaDog,
  FaCat,
  FaSyringe,
  FaHeartbeat,
  FaHome,
  FaFish,
  FaQuestionCircle,
} from "react-icons/fa";

const servicesData: { [key: string]: string[] } = {
  "KMC License": [],
  "Pet Insurance": [],
  Food: [],
  "Vaccination For Dogs": [
    "Puppy DP",
    "Dhppil",
    "Dhppil booster",
    "Rabies",
    "Rabies booster",

    "Kennel Cough",
    "Canine Corona",
  ],
  "Vaccination For Cats": [
    "Tricat",
    "Tricat Booster",
    "Rabies",
    "Rabies Booster",
  ],
  "Health Check": [
    "Blood Test",
    "XRAY",
    "USG",
    "ECHO",
    "Canine Parvo CPV",
    "Canine EHR",
    "Canine Babesia",
    "Canine Distemper",
    "Feline FPV Parvo",
  ],
  "Vet Service": ["On call", "At home", "At clinic"],
  "Health Care Service at Home": [
    "IV-Saline",
    "Injections",
    "Spot On",
    "Deworming",
  ],
  "Medicine Delivery": [],
  "Aquarium Maintenance": [],
};

// Icons for services
const iconsMap: { [key: string]: JSX.Element } = {
  "KMC License": <FaDog />,
  "Pet Insurance": <FaHeartbeat />,
  Food: <FaDog />,
  "Vaccination For Dogs": <FaSyringe />,
  "Vaccination For Cats": <FaSyringe />,
  "Health Check": <FaHeartbeat />,
  "Vet Service": <FaHome />,
  "Health Care Service at Home": <FaHome />,
  "Medicine Delivery": <FaDog />,
  "Aquarium Maintenance": <FaFish />,
};

// Icons for sub-services (default to FaQuestionCircle)
const subIconsMap: { [key: string]: JSX.Element } = {
  "Puppy DP": <FaSyringe />,
  Rabies: <FaSyringe />,
  Tricat: <FaSyringe />,
  // Add more sub-service icons as needed
};

interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
  _id: string;
}

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age?: number;
  weight: number;
  owner: string;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  phoneno: string;
  address: Address;
  pets: Pet[];
}

export default function HomePage() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [subServices, setSubServices] = useState<string[]>([]);
  const [selectedSubService, setSelectedSubService] = useState<string>("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [questions, setQuestions] = useState({
    eats: "",
    vaccinationCard: "",
    illness: "",
    allergy: "",
  });
  const [bookingDate, setBookingDate] = useState<Date[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>(""); // New state for transactionId
  const [paymentStatus, setPaymentStatus] = useState<string>(""); // New state for paymentStatus
  const [regularprice, setRegularPrice] = useState<string>(""); // New state for regularPrice
  const [sellprice, setSellPrice] = useState<string>(""); 
  const [submitted, setSubmitted] = useState<boolean>(false); // New state for form submission

  useEffect(() => {
    async function fetchOwners() {
      const response = await fetch("/api/owner");
      const data = await response.json();
      setOwners(data.Owners);
    }
    fetchOwners();
  }, []);

  const handleMainServiceChange = (service: string) => {
    setSelectedService(service);
    setSubServices(servicesData[service]);
    setSelectedSubService("");
  };

  const handleOwnerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const ownerId = event.target.value;
    setSelectedOwnerId(ownerId);
    const selectedOwner = owners.find((owner) => owner._id === ownerId);
    setPets(selectedOwner ? selectedOwner.pets : []);
  };

  const handlePetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const petId = event.target.value;
    setSelectedPetId(petId);
  };

  const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setQuestions((prevQuestions) => ({
      ...prevQuestions,
      [name]: value,
    }));
  };

  const generateTimeSlots = () => {
    const slots = [];
    let startTime = new Date();
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date();
    endTime.setHours(20, 0, 0, 0);

    while (startTime <= endTime) {
      const timeString = startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      slots.push(timeString);
      startTime.setMinutes(startTime.getMinutes() + 20);
    }

    return slots;
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const resetForm = () => {
    setSelectedService("");
    setSubServices([]);
    setSelectedSubService("");
    setSelectedOwnerId("");
    setSelectedPetId("");
    setQuestions({
      eats: "",
      vaccinationCard: "",
      illness: "",
      allergy: "",
    });
    setBookingDate([]);
    setSelectedTimeSlot("");
    setTransactionId("");
    setPaymentStatus("");
    setRegularPrice("");
    setSellPrice("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Ensure we only send the date in dd/mm/yyyy format without time
    const formattedBookingDate =
      bookingDate.length > 0 ? formatDate(bookingDate[0]) : "";

    const formData = {
      selectedService,
      selectedSubService,
      ownerId: selectedOwnerId,
      petId: selectedPetId,
      questions,
      bookingDate: formattedBookingDate,
      selectedTimeSlot,
      transactionId,   // Include new fields
      paymentStatus,
      regularprice,
      sellprice,
    };

    console.log("Form Data:", formData);

    // Send data to the API
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Booking submitted successfully");
        // After successful submission, set submitted state and reset the form
        setSubmitted(true);
        resetForm();
      } else {
        console.error("Failed to submit booking");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl rounded-lg bg-gray-50 p-8 shadow-lg">
      {!submitted ? (
        <>
          <h1 className="mb-6 text-center text-3xl font-bold">Booking Form</h1>

          <form onSubmit={handleSubmit}>
            {/* Main Services */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-medium">Main Services</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(servicesData).map((service) => (
                  <button
                    key={service}
                    type="button"
                    className={`flex items-center space-x-3 rounded-lg border p-4 transition hover:bg-gray-200 ${
                      selectedService === service
                        ? "bg-blue-500 text-white"
                        : "bg-white"
                    }`}
                    onClick={() => handleMainServiceChange(service)}
                  >
                    <div className="text-2xl">
                      {iconsMap[service] || <FaDog />}
                    </div>
                    <span className="text-lg font-medium">{service}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Services */}
            {subServices.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-medium">
                  Sub Services for {selectedService}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {subServices.map((subService) => (
                    <button
                      key={subService}
                      type="button"
                      className={`flex items-center space-x-3 rounded-lg border p-4 transition hover:bg-gray-200 ${
                        selectedSubService === subService
                          ? "bg-green-500 text-white"
                          : "bg-white"
                      }`}
                      onClick={() => setSelectedSubService(subService)}
                    >
                      <div className="text-2xl">
                        {subIconsMap[subService] || <FaQuestionCircle />}
                      </div>
                      <span className="text-lg font-medium">{subService}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Selection */}
            <div>
              <label className="mb-2 block text-lg font-medium" htmlFor="owner">
                Owner
              </label>
              <select
                id="owner"
                value={selectedOwnerId}
                onChange={handleOwnerChange}
                className="mb-4 w-full rounded-lg border px-4 py-2 hover:border-gray-400 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select an Owner</option>
                {owners.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pet Selection */}
            {pets.length > 0 && (
              <div>
                <label className="mb-2 block text-lg font-medium" htmlFor="pet">
                  Pet
                </label>
                <select
                  id="pet"
                  value={selectedPetId}
                  onChange={handlePetChange}
                  className="mb-4 w-full rounded-lg border px-4 py-2 hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a Pet</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.name} - {pet.species} ({pet.breed})
                    </option>
                  ))}
                </select>
              </div>
            )}

<div className="mb-8">
              <label htmlFor="transactionId" className="block text-lg font-medium text-gray-700">
                Transaction ID
              </label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="paymentStatus" className="block text-lg font-medium text-gray-700">
                Payment Status
              </label>
              <input
                type="text"
                id="paymentStatus"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="regularprice" className="block text-lg font-medium text-gray-700">
                Regular Price
              </label>
              <input
                type="text"
                id="regularprice"
                value={regularprice}
                onChange={(e) => setRegularPrice(e.target.value)}
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="sellPrice" className="block text-lg font-medium text-gray-700">
                Sell Price
              </label>
              <input
                type="text"
                id="sellprice"
                value={sellprice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>



            {/* Yes/No Questions */}
            {["eats", "vaccinationCard", "illness", "allergy"].map((field) => (
              <div key={field} className="mb-4">
                <p className="mb-2 text-lg font-medium capitalize">
                  {field === "vaccinationCard"
                    ? "Does your pet have a vaccination card and is it updated?"
                    : `Is your pet ${field.replace(/([A-Z])/g, " $1")}?`}
                </p>
                <div className="flex gap-4">
                  <label>
                    <input
                      type="radio"
                      name={field}
                      value="yes"
                      checked={
                        questions[field as keyof typeof questions] === "yes"
                      }
                      onChange={handleQuestionChange}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={field}
                      value="no"
                      checked={
                        questions[field as keyof typeof questions] === "no"
                      }
                      onChange={handleQuestionChange}
                    />
                    No
                  </label>
                </div>
              </div>
            ))}

            {/* Booking Date */}
            <div>
              <label
                className="mb-2 block text-lg font-medium"
                htmlFor="bookingDate"
              >
                Booking Date
              </label>
              <Flatpickr
                value={bookingDate}
                onChange={setBookingDate}
                options={{
                  dateFormat: "d/m/Y",
                }}
                className="mb-4 w-full rounded-lg border px-4 py-2 hover:border-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="mb-2 block text-lg font-medium">
                Select Time Slot
              </label>
              <div className="mb-6 grid grid-cols-5 gap-2">
                {generateTimeSlots().map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`rounded-lg border p-2 text-center ${
                      selectedTimeSlot === slot
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedTimeSlot(slot);
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-green-600">
            Booking Successful!
          </h2>
          <p className="text-lg">
            Your booking has been submitted successfully. We'll contact you
            shortly.
          </p>
          <button
            className="mt-6 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
            onClick={() => setSubmitted(false)} // Reset the form to allow another booking
          >
            Make Another Booking
          </button>
        </div>
      )}
    </div>
  );
}
