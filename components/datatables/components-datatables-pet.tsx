"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";

import IconPlus from "@/components/icon/icon-plus"; // Your icon import
import IconXCircle from "@/components/icon/icon-x-circle"; // For closing button
import IconEdit from "@/components/icon/icon-edit"; // Edit icon
import IconTrash from "@/components/icon/icon-trash"; // Delete icon
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Flatpickr from "react-flatpickr"; // For date picker
import "flatpickr/dist/themes/material_green.css"; // Date picker theme
import sortBy from "lodash/sortBy"; // For sorting records
import { format, parse } from "date-fns"; // To handle date formatting
import Select from "react-select";

const MySwal = withReactContent(Swal);

const ComponentsDatatablesPet = () => {
  const [modal1, setModal1] = useState(false); // Modal state for adding pet
  const [editid, setEditId] = useState(null);
  const [modalEdit, setModalEdit] = useState(false); // Modal state for editing pet
  const [owners, setOwners] = useState([]); // State to store owners
  const [initialRecords, setInitialRecords] = useState([]); // Initial fetched records
  const [recordsData, setRecordsData] = useState([]); // Data to display in the table
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "name",
    direction: "asc",
  });
  const [selectedPet, setSelectedPet] = useState(null); // To store selected pet for editing
  const currentDate = format(new Date(), "dd/MM/yyyy");

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    date_of_birth: "",
    size_of_pet: "",
    aggressive: "",
    gender: "",
    age: "",
    weight: "",
    owner: "", // Owner selected from dropdown
    vaccination_records: "No", // Default to No
    vaccine_name: "", // Only shown if vaccination_records is "Yes"
    date_administered: "", // Only shown if vaccination_records is "Yes"
    insurance_policy: "No", // Default insurance policy is "No"
    policy_number: "",
    provider: "",
    coverage_start_date: "",
    coverage_end_date: "",
    annual_limit: "",
    coverage_type: "Comprehensive",
    weight_taken_date: currentDate,
  });
  const speciesOptions = [
    { value: "Dog", label: "Dog" },
    { value: "Cat", label: "Cat" },
    { value: "Bird", label: "Bird" },
    { value: "Rabbit", label: "Rabbit" },
    { value: "Others", label: "Others" },
  ];

  const breedOptions = {
    Dog: [
      { value: "Labrador", label: "Labrador" },
      { value: "German Shepherd", label: "German Shepherd" },
      { value: "Golden Retriever", label: "Golden Retriever" },
    ],
    Cat: [
      { value: "Persian", label: "Persian" },
      { value: "Siamese", label: "Siamese" },
      { value: "Maine Coon", label: "Maine Coon" },
    ],
    Rabbit: [
      { value: "Holland Lop", label: "Holland Lop" },
      { value: "Netherland Dwarf", label: "Netherland Dwarf" },
    ],
    Bird: [
      { value: "Parrot", label: "Parrot" },
      { value: "Canary", label: "Canary" },
      { value: "Finch", label: "Finch" },
    ],
  };

  const openModal = () => {
    // Reset formData to its initial state when opening the "Add Pet" modal
    setFormData({
      name: "",
      species: "",
      breed: "",
      age: "",
      weight: "",
      owner: "", // Owner selected from dropdown
      vaccination_records: "No", // Default to No
      vaccine_name: "", // Only shown if vaccination_records is "Yes"
      date_administered: "", // Only shown if vaccination_records is "Yes"
      insurance_policy: "No", // Default insurance policy is "No"
      policy_number: "",
      provider: "",
      coverage_start_date: "",
      coverage_end_date: "",
      annual_limit: "",
      coverage_type: "Comprehensive",
      date_of_birth: "",
      gender: "",
      size_of_pet: "",
      aggressive: "",
      weight_taken_date: currentDate,
    });
    setModal1(true); // Open the modal
  };

  const closeModal = () => setModal1(false);

  const handleSpeciesChange = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      species: selectedOption.value, // Update species
      breed: "", // Reset breed when species changes
    }));
  };
  const openEditModal = (pet) => {
    setSelectedPet(pet);
    setEditId(pet._id); // Set the selected pet for editing
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      owner: pet.owner._id, // Make sure this is set correctly
      vaccination_records: pet.vaccination_records.length > 0 ? "Yes" : "No",
      vaccine_name: pet.vaccination_records[0]?.vaccine_name || "",
      date_administered: pet.vaccination_records[0]?.date_administered
        ? format(
            new Date(pet.vaccination_records[0].date_administered),
            "dd/MM/yyyy"
          )
        : "",
      insurance_policy: pet.insurance_policy ? "Yes" : "No",
      policy_number: pet.insurance_policy?.policy_number || "",
      provider: pet.insurance_policy?.provider || "",
      coverage_start_date: pet.insurance_policy?.coverage_start_date
        ? format(
            new Date(pet.insurance_policy.coverage_start_date),
            "dd/MM/yyyy"
          )
        : "",
      coverage_end_date: pet.insurance_policy?.coverage_end_date
        ? format(new Date(pet.insurance_policy.coverage_end_date), "dd/MM/yyyy")
        : "",
      annual_limit: pet.insurance_policy?.annual_limit || "",
      coverage_type: pet.insurance_policy?.coverage_type || "Comprehensive",
    });
    setModalEdit(true); // Open the edit modal
  };

  const closeEditModal = () => setModalEdit(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fetch owners from the API
  const fetchOwnerData = async () => {
    try {
      const response = await fetch("/api/owner");
      const data = await response.json();

      if (data.Owners && Array.isArray(data.Owners)) {
        setOwners(data.Owners); // Set owners in the state
        return data.Owners;
      } else {
        console.error("Owners data is not an array or missing.");
      }
    } catch (error) {
      console.error("Error fetching owner data:", error);
    }
    return [];
  };

  // Fetch pet data and merge with owner names
  const fetchPetData = async () => {
    try {
      // Fetch owners first
      const ownersData = await fetchOwnerData();
      //("Owners Data:", ownersData); // Log owners data

      // Fetch pets data
      const response = await fetch("/api/pet");
      const data = await response.json();
      //console.log("Pet Data from API:", data); // Log pet data

      if (data.pets && Array.isArray(data.pets)) {
        // Merge owner name with each pet
        const petsWithOwnerNames = data.pets.map((pet) => {
          const owner = ownersData.find((o) => o._id === pet.owner._id);
          return {
            ...pet,
            ownerName: owner ? owner.name : "Unknown", // Add owner name
          };
        });

        setInitialRecords(sortBy(petsWithOwnerNames, "name"));
        setRecordsData(petsWithOwnerNames.slice(0, pageSize)); // Initial page load data
      } else {
        console.error("Pets data is not an array or missing.");
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
    }
  };

  // Handle delete pet
  const handleDelete = async (petId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await fetch(`/api/pet/${petId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          Swal.fire("Deleted!", "The pet has been deleted.", "success");
          fetchPetData(); // Refresh the pet data after deletion
        } else {
          console.error("Failed to delete pet");
        }
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
    }
  };

  useEffect(() => {
    fetchPetData(); // Fetch pet data when component mounts
  }, []);

  // Handle pagination
  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData(initialRecords.slice(from, to)); // Paginate records
  }, [page, pageSize, initialRecords]);

  // Handle add and edit form submit
  const handleFormSubmit = async (event, isEdit = false) => {
    event.preventDefault();

    // Format date fields
    const formattedFormData = {
      ...formData,
      date_of_birth: formData.date_of_birth,

      weight_taken_date: formData.weight_taken_date,

      coverage_start_date: formData.coverage_start_date
        ? format(
            parse(formData.coverage_start_date, "dd/MM/yyyy", new Date()),
            "yyyy-MM-dd"
          )
        : "",
      coverage_end_date: formData.coverage_end_date
        ? format(
            parse(formData.coverage_end_date, "dd/MM/yyyy", new Date()),
            "yyyy-MM-dd"
          )
        : "",
      date_administered: formData.date_administered
        ? format(
            parse(formData.date_administered, "dd/MM/yyyy", new Date()),
            "yyyy-MM-dd"
          )
        : "",
    };

    try {
      const method = isEdit ? "PUT" : "POST";
      const endpoint = isEdit ? `/api/pet/${selectedPet}` : "/api/pet";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedFormData),
      });

      if (response.ok) {
        MySwal.fire({
          title: isEdit ? "Pet Updated Successfully" : "Pet Added Successfully",
          toast: true,
          position: "bottom-start",
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
        });
        fetchPetData(); // Refresh pet data after adding/editing a pet
        isEdit ? closeEditModal() : closeModal();
      } else {
        console.error("Failed to save pet:", await response.json());
      }
    } catch (error) {
      console.error("Error while saving pet:", error);
    }
  };

  const handleUpdateClick = async (petId) => {
    try {
      //console.log("Fetching data for pet ID:", petId);
      const res = await fetch(`/api/pet/${petId}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch data for pet ID: ${petId}`);
      }

      const data = await res.json();
      console.log("owenerid", data.pet.owner._id);
      // Set the form data with the fetched pet details
      setFormData({
        name: data.pet.name,
        species: data.pet.species,
        breed: data.pet.breed,
        gender: data.pet.gender,
        weight: data.pet.weight,
        owner: data.pet.owner._id,
        date_of_birth: data.pet.date_of_birth,
        insurance_policy: data.pet.insurance_policy,
        date_administered: data.pet.date_administered,
        medication_history: data.pet.medication_history,
        vaccination_history: data.pet.vaccination_history,
        medical_history: data.pet.medical_history,
        size_of_pet: data.pet.size_of_pet,
        aggressive: data.pet.aggressive,
        weight_taken_date: data.pet.weight_taken_date,
      });

      setSelectedPet(petId);
      setModalEdit(true);
    } catch (error) {
      console.error("Error fetching pet data:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Pets</h5>

      {/* Button to open modal */}
      <button
        type="button"
        className="btn btn-primary my-5"
        onClick={openModal}
      >
        <IconPlus className="ltr:mr-2 rtl:ml-2" />
        Add Pet
      </button>

      {/* Modal for adding a pet */}
      <Transition appear show={modal1} as={Fragment}>
        <Dialog as="div" open={modal1} onClose={closeModal}>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                  <div className="text-lg font-bold">Add New Pet</div>
                  <button
                    type="button"
                    className="text-white-dark hover:text-dark"
                    onClick={closeModal}
                  >
                    <IconXCircle />
                  </button>
                </div>

                {/* Form to add new pet */}
                <div className="p-5">
                  <form
                    className="space-y-5"
                    onSubmit={(e) => handleFormSubmit(e, false)}
                  >
                    {/* Form fields */}
                    <div>
                      <label htmlFor="owner">Owner</label>
                      <select
                        id="owner"
                        name="owner"
                        className="form-select"
                        value={formData.owner}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Owner</option>
                        {owners.map((owner) => (
                          <option key={owner._id} value={owner._id}>
                            {owner.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="name">Pet Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter pet name"
                        className="form-input"
                        onChange={handleChange}
                        value={formData.name}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="species">Species</label>
                      <Select
                        id="species"
                        name="species"
                        options={speciesOptions}
                        value={speciesOptions.find(
                          (opt) => opt.value === formData.species
                        )}
                        onChange={handleSpeciesChange}
                        placeholder="Select species"
                        required
                      />
                    </div>
                    {/* Conditionally render Breed field */}
                    {formData.species && formData.species !== "Others" && (
                      <div>
                        <label htmlFor="breed">Breed</label>
                        <Select
                          id="breed"
                          name="breed"
                          options={breedOptions[formData.species] || []}
                          value={breedOptions[formData.species]?.find(
                            (opt) => opt.value === formData.breed
                          )}
                          onChange={(selectedOption) =>
                            setFormData({
                              ...formData,
                              breed: selectedOption.value,
                            })
                          }
                          placeholder={`Select ${formData.species} breed`}
                          required
                        />
                      </div>
                    )}
                    {/* Render a text input for breed if "Others" is selected */}
                    {formData.species === "Others" && (
                      <div>
                        <label htmlFor="breed">Breed</label>
                        <input
                          id="breed"
                          name="breed"
                          type="text"
                          placeholder="Enter breed"
                          className="form-input"
                          onChange={handleChange}
                          value={formData.breed}
                        />
                      </div>
                    )}
                    <div>
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        className="form-select"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="date_of_birth">Date of Birth</label>
                      <Flatpickr
                        id="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            date_of_birth: format(date[0], "dd/MM/yyyy"),
                          })
                        }
                        className="form-input"
                        options={{
                          dateFormat: "d/m/Y",
                          enableTime: false,
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="size_of_pet">Size of Pet</label>
                      <select
                        id="size_of_pet"
                        name="size_of_pet"
                        className="form-select"
                        value={formData.size_of_pet}
                        onChange={handleChange}
                      >
                        <option value="">Select Size</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                        <option value="Giant">Giant</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="aggressive">Aggressive</label>
                      <select
                        id="aggressive"
                        name="aggressive"
                        className="form-select"
                        value={formData.aggressive}
                        onChange={handleChange}
                      >
                        <option value="">Select Aggressiveness</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Moderate">Moderate</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="weight">Weight(kgs)</label>
                      <input
                        id="weight"
                        name="weight"
                        type="number"
                        placeholder="Enter weight"
                        className="form-input"
                        onChange={handleChange}
                        value={formData.weight}
                      />
                    </div>
                    <div>
                      <label htmlFor="weight_taken_date">
                        Weight Taken Date
                      </label>
                      <Flatpickr
                        id="weight_taken_date"
                        value={formData.weight_taken_date}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            weight_taken_date: format(date[0], "dd/MM/yyyy"),
                          })
                        }
                        className="form-input"
                        options={{
                          dateFormat: "d/m/Y",
                          enableTime: false,
                        }}
                      />
                    </div>

                    {/* Vaccination records dropdown */}
                    <div>
                      <label htmlFor="vaccination_records">Vaccination</label>
                      <select
                        id="vaccination_records"
                        name="vaccination_records"
                        className="form-select"
                        value={formData.vaccination_records}
                        onChange={handleChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    {/* Vaccine name and date fields, show if vaccination_records is "Yes" */}
                    {formData.vaccination_records === "Yes" && (
                      <div>
                        <div>
                          <label htmlFor="vaccine_name">Vaccine Name</label>
                          <input
                            id="vaccine_name"
                            name="vaccine_name"
                            type="text"
                            placeholder="Enter vaccine name"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.vaccine_name}
                          />
                        </div>
                        <div>
                          <label htmlFor="date_administered">
                            Date Administered
                          </label>
                          <Flatpickr
                            value={formData.date_administered}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                date_administered: format(
                                  date[0],
                                  "dd/MM/yyyy"
                                ),
                              })
                            }
                            className="form-input"
                            options={{
                              dateFormat: "d/m/Y", // Ensure it's dd/MM/yyyy only
                              enableTime: false, // Remove time selection
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {/* Insurance policy dropdown */}
                    <div>
                      <label htmlFor="insurance_policy">Insurance Policy</label>
                      <select
                        id="insurance_policy"
                        name="insurance_policy"
                        className="form-select"
                        value={formData.insurance_policy}
                        onChange={handleChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    {/* Show insurance policy fields if insurance_policy is "Yes" */}
                    {formData.insurance_policy === "Yes" && (
                      <div>
                        <div>
                          <label htmlFor="policy_number">Policy Number</label>
                          <input
                            id="policy_number"
                            name="policy_number"
                            type="text"
                            placeholder="Enter policy number"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.policy_number}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="provider">Provider</label>
                          <input
                            id="provider"
                            name="provider"
                            type="text"
                            placeholder="Enter provider"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.provider}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="coverage_start_date">
                            Coverage Start Date
                          </label>
                          <Flatpickr
                            value={formData.coverage_start_date}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                coverage_start_date: format(
                                  date[0],
                                  "dd/MM/yyyy"
                                ),
                              })
                            }
                            className="form-input"
                            options={{
                              dateFormat: "d/m/Y",
                              enableTime: false,
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="coverage_end_date">
                            Coverage End Date
                          </label>
                          <Flatpickr
                            value={formData.coverage_end_date}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                coverage_end_date: format(
                                  date[0],
                                  "dd/MM/yyyy"
                                ),
                              })
                            }
                            className="form-input"
                            options={{
                              dateFormat: "d/m/Y",
                              enableTime: false,
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="annual_limit">Annual Limit</label>
                          <input
                            id="annual_limit"
                            name="annual_limit"
                            type="number"
                            placeholder="Enter annual limit"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.annual_limit}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="coverage_type">Coverage Type</label>
                          <select
                            id="coverage_type"
                            name="coverage_type"
                            className="form-select"
                            value={formData.coverage_type}
                            onChange={handleChange}
                            required
                          >
                            <option value="Comprehensive">Comprehensive</option>
                            <option value="Basic">Basic</option>
                            <option value="Accident Only">Accident Only</option>
                          </select>
                        </div>
                      </div>
                    )}
                    {/* Submit button */}
                    <button type="submit" className="btn btn-primary !mt-6">
                      Submit
                    </button>
                  </form>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal for editing a pet */}
      <Transition appear show={modalEdit} as={Fragment}>
        <Dialog as="div" open={modalEdit} onClose={closeEditModal}>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                  <div className="text-lg font-bold">Edit Pet</div>
                  <button
                    type="button"
                    className="text-white-dark hover:text-dark"
                    onClick={closeEditModal}
                  >
                    <IconXCircle />
                  </button>
                </div>

                {/* Form to edit pet */}
                <div className="p-5">
                  <form
                    className="space-y-5"
                    onSubmit={(e) => handleFormSubmit(e, true)}
                  >
                    {/* Owner */}

                    {/* Name */}
                    <div>
                      <label htmlFor="name">Pet Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter pet name"
                        className="form-input"
                        onChange={handleChange}
                        value={formData.name}
                        required
                      />
                    </div>

                    {/* Species */}
                    <div>
                      <label htmlFor="species">Species</label>
                      <Select
                        id="species"
                        name="species"
                        options={speciesOptions}
                        value={speciesOptions.find(
                          (opt) => opt.value === formData.species
                        )}
                        onChange={handleSpeciesChange}
                        placeholder="Select species"
                        required
                      />
                    </div>

                    {/* Conditionally render Breed field */}
                    {formData.species && formData.species !== "Others" && (
                      <div>
                        <label htmlFor="breed">Breed</label>
                        <Select
                          id="breed"
                          name="breed"
                          options={breedOptions[formData.species] || []}
                          value={breedOptions[formData.species]?.find(
                            (opt) => opt.value === formData.breed
                          )}
                          onChange={(selectedOption) =>
                            setFormData({
                              ...formData,
                              breed: selectedOption.value,
                            })
                          }
                          placeholder={`Select ${formData.species} breed`}
                          required
                        />
                      </div>
                    )}

                    {/* Render a text input for breed if "Others" is selected */}
                    {formData.species === "Others" && (
                      <div>
                        <label htmlFor="breed">Breed</label>
                        <input
                          id="breed"
                          name="breed"
                          type="text"
                          placeholder="Enter breed"
                          className="form-input"
                          onChange={handleChange}
                          value={formData.breed}
                        />
                      </div>
                    )}

                    {/* Gender */}
                    <div>
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        className="form-select"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label htmlFor="date_of_birth">Date of Birth</label>
                      <Flatpickr
                        id="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            date_of_birth: format(date[0], "dd/MM/yyyy"),
                          })
                        }
                        className="form-input"
                        options={{
                          dateFormat: "d/m/Y",
                          enableTime: false,
                        }}
                      />
                    </div>

                    {/* Size of Pet */}
                    <div>
                      <label htmlFor="size_of_pet">Size of Pet</label>
                      <select
                        id="size_of_pet"
                        name="size_of_pet"
                        className="form-select"
                        value={formData.size_of_pet}
                        onChange={handleChange}
                      >
                        <option value="">Select Size</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                        <option value="Giant">Giant</option>
                      </select>
                    </div>

                    {/* Aggressiveness */}
                    <div>
                      <label htmlFor="aggressive">Aggressive</label>
                      <select
                        id="aggressive"
                        name="aggressive"
                        className="form-select"
                        value={formData.aggressive}
                        onChange={handleChange}
                      >
                        <option value="">Select Aggressiveness</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Moderate">Moderate</option>
                      </select>
                    </div>

                    {/* Weight */}
                    <div>
                      <label htmlFor="weight">Weight (kgs)</label>
                      <input
                        id="weight"
                        name="weight"
                        type="number"
                        placeholder="Enter weight"
                        className="form-input"
                        onChange={handleChange}
                        value={formData.weight}
                      />
                    </div>
                    <div>
                      <label htmlFor="weight_taken_date">
                        Weight Taken Date
                      </label>
                      <Flatpickr
                        id="weight_taken_date"
                        value={formData.weight_taken_date}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            weight_taken_date: format(date[0], "dd/MM/yyyy"),
                          })
                        }
                        className="form-input"
                        options={{
                          dateFormat: "d/m/Y",
                          enableTime: false,
                        }}
                      />
                    </div>

                    {/* Vaccination records */}
                    <div>
                      <label htmlFor="vaccination_records">Vaccination</label>
                      <select
                        id="vaccination_records"
                        name="vaccination_records"
                        className="form-select"
                        value={formData.vaccination_records}
                        onChange={handleChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    {/* Conditional rendering of Vaccine fields */}
                    {formData.vaccination_records === "Yes" && (
                      <div>
                        <div>
                          <label htmlFor="vaccine_name">Vaccine Name</label>
                          <input
                            id="vaccine_name"
                            name="vaccine_name"
                            type="text"
                            placeholder="Enter vaccine name"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.vaccine_name}
                          />
                        </div>
                        <div>
                          <label htmlFor="date_administered">
                            Date Administered
                          </label>
                          <Flatpickr
                            value={formData.date_administered}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                date_administered: format(
                                  date[0],
                                  "dd/MM/yyyy"
                                ),
                              })
                            }
                            className="form-input"
                            options={{
                              dateFormat: "d/m/Y",
                              enableTime: false,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Insurance Policy */}
                    <div>
                      <label htmlFor="insurance_policy">Insurance Policy</label>
                      <select
                        id="insurance_policy"
                        name="insurance_policy"
                        className="form-select"
                        value={formData.insurance_policy}
                        onChange={handleChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    {/* Conditional rendering of Insurance fields */}
                    {formData.insurance_policy === "Yes" && (
                      <div>
                        <div>
                          <label htmlFor="policy_number">Policy Number</label>
                          <input
                            id="policy_number"
                            name="policy_number"
                            type="text"
                            placeholder="Enter policy number"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.policy_number}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="provider">Provider</label>
                          <input
                            id="provider"
                            name="provider"
                            type="text"
                            placeholder="Enter provider"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.provider}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="coverage_start_date">
                            Coverage Start Date
                          </label>
                          <Flatpickr
                            value={formData.coverage_start_date}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                coverage_start_date: format(
                                  date[0],
                                  "dd/MM/yyyy"
                                ),
                              })
                            }
                            className="form-input"
                            options={{
                              dateFormat: "d/m/Y",
                              enableTime: false,
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="coverage_end_date">
                            Coverage End Date
                          </label>
                          <Flatpickr
                            value={formData.coverage_end_date}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                coverage_end_date: format(
                                  date[0],
                                  "dd/MM/yyyy"
                                ),
                              })
                            }
                            className="form-input"
                            options={{
                              dateFormat: "d/m/Y",
                              enableTime: false,
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="annual_limit">Annual Limit</label>
                          <input
                            id="annual_limit"
                            name="annual_limit"
                            type="number"
                            placeholder="Enter annual limit"
                            className="form-input"
                            onChange={handleChange}
                            value={formData.annual_limit}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="coverage_type">Coverage Type</label>
                          <select
                            id="coverage_type"
                            name="coverage_type"
                            className="form-select"
                            value={formData.coverage_type}
                            onChange={handleChange}
                            required
                          >
                            <option value="Comprehensive">Comprehensive</option>
                            <option value="Basic">Basic</option>
                            <option value="Accident Only">Accident Only</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary !mt-6">
                      Update
                    </button>
                  </form>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* DataTable for listing pets */}
      <div className="datatables">
        <DataTable
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={recordsData}
          columns={[
            { accessor: "name", sortable: true, title: "Name" },
            { accessor: "species", sortable: true, title: "Species" },
            { accessor: "breed", sortable: true, title: "Breed" },
            {
              accessor: "date_of_birth",
              sortable: true,
              title: "Date of Birth",
              render: (record) =>
                record.date_of_birth ? record.date_of_birth : "N/A", // Display "N/A" if date_of_birth is missing or invalid
            },
            { accessor: "weight", sortable: true, title: "Weight" },
            { accessor: "owner.name", sortable: true, title: "Owner" }, // Display owner name
            {
              accessor: "insurance_policy.policy_number",
              sortable: true,
              title: "Insurance Policy",
              render: (record) =>
                record.insurance_policy
                  ? record.insurance_policy.policy_number
                  : "N/A", // Handle null insurance policy
            },
            {
              accessor: "actions",
              title: "Actions",
              render: (record) => (
                <div className="flex space-x-4">
                  <button
                    className="btn btn-warning"
                    onClick={() => handleUpdateClick(record._id)}
                  >
                    <IconEdit />
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(record._id)}
                  >
                    <IconTrash />
                  </button>
                </div>
              ),
            },
          ]}
          totalRecords={initialRecords.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
        />
      </div>
    </div>
  );
};

export default ComponentsDatatablesPet;
