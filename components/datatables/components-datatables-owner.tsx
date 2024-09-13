"use client";

import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState, Fragment, useRef } from "react";
import sortBy from "lodash/sortBy";
import IconFile from "@/components/icon/icon-file";
import { Dialog, Transition } from "@headlessui/react";
import IconPrinter from "@/components/icon/icon-printer";
import IconPlus from "../icon/icon-plus";
import IconBince from "@/components/icon/icon-bookmark";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import IconXCircle from "@/components/icon/icon-x-circle";
import IconPencil from "@/components/icon/icon-pencil";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import Select from "react-select";
import { format } from "date-fns";
const MySwal = withReactContent(Swal);

const initialRowData = [
  {
    id: "989",
    name: "guygipgilgyi",
    address: {
      street: "123 Elm St",
      city: "Gotham",
      zip: "12345",
      country: "USA",
    },
    phoneno: "1234567890",
    email: "abc@gmail.com",
    pets: [], // Add pets field here
  },
];

const col = [
  "id",
  "name",
  "address.street",
  "address.city",
  "address.zip",
  "address.country",
  "phoneno",
  "email",
  "pets", // Add pets field to column
];

const ComponentsDatatablesOwner = () => {
  const currentYear = new Date().getFullYear().toString();
  const currentDate = format(new Date(), "dd/MM/yyyy");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";
  const [modal1, setModal1] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [page, setPage] = useState(1);
  const [documentfile, setDocumentFile] = useState(null);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState(
    sortBy(initialRowData, "id")
  );
  const [recordsData, setRecordsData] = useState(initialRecords);

  const [cutomerid, setcutomerid] = useState("");
  const [cutomerName, setcutomerName] = useState("");
  const [updatedate, setUpdatedate] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [hiddenFileName, setHiddenFileName] = useState("");
  const [recordsDatasort, setRecordsDatashort] = useState("dsc");
  const [modal2, setModal2] = useState(false);
  const [editid, setEditid] = useState("");
  const [deleteid, setDeleteid] = useState("");

  const [modalPet, setModalPet] = useState(false); // Modal for adding pets
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const formatDate = (date) => {
    if (!date) return "";
    const dt = new Date(date);
    if (isNaN(dt)) return "";
    const month = (dt.getMonth() + 1).toString().padStart(2, "0");
    const day = dt.getDate().toString().padStart(2, "0");
    const year = dt.getFullYear();
    return `${day}/${month}/${year}`;
  };
  // Specific function to handle changes in react-select
  const handleSpeciesChange = (selectedOption) => {
    setPetFormData((prevFormData) => ({
      ...prevFormData,
      species: selectedOption.value, // Update species
      breed: "", // Reset breed when species changes
    }));
  };
  const handleBreedChange = (selectedOption) => {
    setPetFormData((prevFormData) => ({
      ...prevFormData,
      breed: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleDateChange = (date) => {
    if (date && date[0]) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        date: formatDate(date[0]),
      }));
    }
  };

  const newOwneradded = () => {
    MySwal.fire({
      title: "New Parent has been added",
      toast: true,
      position: "bottom-start",
      showConfirmButton: false,
      timer: 5000,
      showCloseButton: true,
    });
  };

  const updatedOwner = () => {
    MySwal.fire({
      title: "Parent has been updated",
      toast: true,
      position: "bottom-start",
      showConfirmButton: false,
      timer: 5000,
      showCloseButton: true,
    });
  };

  const deletedowner = () => {
    MySwal.fire({
      title: "Parent has been deleted",
      toast: true,
      position: "bottom-start",
      showConfirmButton: false,
      timer: 5000,
      showCloseButton: true,
    });
  };

  interface Owner {
    id: string;
    name: string;
    address: {
      street: string;
      city: string;
      zip: string;
      country: string;
    };
    phoneno: string;
    email: string;
    pets: Array<any>; // Include the pets array
  }

  const handleDeleteClick = (value: any) => {
    setModal2(true);
    setDeleteid(value);
  };
  const handlePetFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/pet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(petFormData),
      });

      if (response.ok) {
        MySwal.fire({
          title: "Pet Added Successfully",
          toast: true,
          position: "bottom-start",
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
        });
        closePetModal(); // Close modal after successful pet addition
      } else {
        console.error("Failed to add pet:", await response.json());
      }
    } catch (error) {
      console.error("Error adding pet:", error);
    }
  };

  const fetchOwnerData = async () => {
    try {
      const response = await fetch("/api/owner");
      if (!response.ok) {
        throw new Error("Failed to fetch Parent data");
      }
      const data = await response.json();

      const formattedOwner = data.Owners.map((owner: Owner) => ({
        id: owner._id,
        name: owner.name,
        address: owner.address,
        phoneno: owner.phoneno,
        email: owner.email,
        pets: owner.pets, // Assign pets array
      }));

      setInitialRecords(formattedOwner);
      setRecordsData(
        formattedOwner.slice((page - 1) * pageSize, page * pageSize)
      );
      setLoading(false);
      // console.log("Fetched data:", formattedOwner);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };
  const handleAddPet = (ownerId) => {
    // console.log(ownerId);
    setSelectedOwnerId(ownerId);
    setPetFormData((prevFormData) => ({
      ...prevFormData,
      owner: ownerId,
    }));
    setModalPet(true);
  };
  const closePetModal = () => {
    setModalPet(false);
    setPetFormData({
      name: "",
      species: "",
      breed: "",
      age: "",
      weight: "",
      owner: "",
      vaccination_records: "No",
      vaccine_name: "",
      date_administered: "",
      insurance_policy: "No",
      policy_number: "",
      provider: "",
      coverage_start_date: "",
      coverage_end_date: "",
      annual_limit: "",
      coverage_type: "Comprehensive",
    });
  };
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
  useEffect(() => {
    fetchOwnerData();
  }, []);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "_id",
    direction: "desc",
  });
  const [petFormData, setPetFormData] = useState({
    name: "",
    species: "",
    breed: "",
    date_of_birth: "",
    weight: "",
    owner: "",
    vaccination_records: "No",
    vaccine_name: "",
    date_administered: "",
    insurance_policy: "No",
    policy_number: "",
    provider: "",
    coverage_start_date: "",
    coverage_end_date: "",
    annual_limit: "",
    weight_taken_date: currentDate,
    coverage_type: "Comprehensive",
  });
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    const filteredRecords = initialRecords.filter((item: any) => {
      return (
        item.id.toString().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.address.street.toLowerCase().includes(search.toLowerCase()) ||
        item.address.city.toLowerCase().includes(search.toLowerCase()) ||
        item.address.zip.toString().includes(search.toLowerCase()) ||
        item.address.country.toLowerCase().includes(search.toLowerCase()) ||
        item.phoneno.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())
      );
    });

    setRecordsData(
      filteredRecords.slice((page - 1) * pageSize, page * pageSize)
    );
  }, [search, initialRecords, page, pageSize]);

  useEffect(() => {
    const sortedData = sortBy(initialRecords, sortStatus.columnAccessor);
    const finalData =
      sortStatus.direction === "desc" ? sortedData.reverse() : sortedData;
    setRecordsData(finalData.slice((page - 1) * pageSize, page * pageSize));
  }, [sortStatus, page, pageSize, initialRecords]);

  const handleDeleteData = async () => {
    setModal2(false);

    const res = await fetch(`/api/owner/${deleteid}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchOwnerData();
      deletedowner();
    }
  };

  const getcustomeval = () => {
    setEditid("");
    setFiles([]);
    setFormData({
      id: "",
      name: "",
      address: {
        street: "",
        city: "",
        zip: "",
        country: "",
      },
      phoneno: "",
      email: "",
      date: formatDate(new Date()),
    });
    setModal1(true);
  };

  const capitalize = (text) => {
    return text
      .replace("_", " ")
      .replace("-", " ")
      .toLowerCase()
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
  };

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: {
      street: "",
      city: "",
      zip: "",
      country: "",
    },
    phoneno: "",
    email: "",
    password: "",
    date: formatDate(new Date()),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If dealing with nested keys (like address), update appropriately
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prevFormData) => ({
        ...prevFormData,
        address: {
          ...prevFormData.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const pethandleChange = (e) => {
    const { name, value } = e.target;

    setPetFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Dynamically update the state based on the input name
    }));
  };

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      id: editid,
    }));
  }, [editid]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formattedFormData = {
      ...formData,
      date: formData.date ? formData.date.split("/").reverse().join("-") : "",
    };

    try {
      let response;

      if (!editid) {
        let docname = "";
        if (documentfile) {
          const documentfilename = documentfile.name;
          docname = documentfilename;
          formattedFormData.document = docname;
        }

        response = await fetch("/api/owner", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedFormData),
        });

        if (response.ok) {
          newOwneradded();
          fetchOwnerData();
          setModal1(false);

          if (documentfile) {
            const uploadFormData = new FormData();
            uploadFormData.append("documentfile", documentfile);
            uploadFormData.append("documentfilename", docname);

            const res = await fetch("/api/uploadexp", {
              method: "POST",
              body: uploadFormData,
            });

            if (res.ok) {
              alert("Owner uploaded successfully");
            } else {
              alert("Owner upload failed");
            }
          }
        } else {
          // console.log("Failed to add new owner:", await response.json());
        }
      } else {
        const url = `/api/owner/${editid}`;

        response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedFormData),
        });

        if (response.ok) {
          setModal1(false);
          fetchOwnerData();
          updatedOwner();
        } else {
          console.log("Failed to update owner:", await response.json());
        }
      }
    } catch (error) {
      console.log("Error during submission:", error);
    }
  };

  const handleUpdateClick = async (value) => {
    try {
      // console.log("Fetching data for ID:", value);
      const res = await fetch(`/api/owner/${value}`, {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch data for ID: ${value}`);
      }
      const data = await res.json();

      setUpdatedate(formatDate(data.owner.date));

      setFormData({
        id: data.owner._id,
        name: data.owner.name,
        address: {
          street: data.owner.address.street,
          city: data.owner.address.city,
          zip: data.owner.address.zip,
          country: data.owner.address.country,
        },
        phoneno: data.owner.phoneno,
        email: data.owner.email,
        date: formatDate(data.owner.date),
      });

      setEditid(data.owner._id);

      setModal1(true);
    } catch (error) {
      console.error("Fetch error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (editid) {
      const owner = initialRecords.find((record) => record.id === editid);
      if (owner) {
        setFormData({
          id: owner.id,
          name: owner.name,
          address: {
            street: owner.address.street,
            city: owner.address.city,
            zip: owner.address.zip,
            country: owner.address.country,
          },
          phoneno: owner.phoneno,
          email: owner.email,
          date: formatDate(owner.date),
        });
      }
    }
  }, [editid, initialRecords]);

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Parents
      </h5>

      <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center">
          <div className="mb-5">
            <div className="flex items-center justify-center"></div>
            <Transition appear show={modal1} as={Fragment}>
              <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                  <div className="flex min-h-screen items-start justify-center px-4">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel
                        as="div"
                        className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                      >
                        <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                          <div className="text-lg font-bold">
                            {editid ? "Update Parent" : "Add Parent"}
                          </div>
                          <button
                            type="button"
                            className="text-white-dark hover:text-dark"
                            onClick={() => setModal1(false)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-5">
                          <div className="mb-5">
                            <form
                              className="space-y-5"
                              onSubmit={handleFormSubmit}
                            >
                              <div>
                                <label htmlFor="name">Name</label>
                                <div>
                                  <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter name"
                                    onChange={handleChange}
                                    className="form-input"
                                    value={formData.name}
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <label htmlFor="address.street">Street</label>
                                <input
                                  id="address.street"
                                  type="text"
                                  name="address.street"
                                  onChange={handleChange}
                                  className="form-input"
                                  value={formData.address.street}
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="address.city">City</label>
                                <input
                                  id="address.city"
                                  type="text"
                                  name="address.city"
                                  onChange={handleChange}
                                  className="form-input"
                                  value={formData.address.city}
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="address.zip">Zip</label>
                                <input
                                  id="address.zip"
                                  type="text"
                                  name="address.zip"
                                  onChange={handleChange}
                                  className="form-input"
                                  value={formData.address.zip}
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="address.country">Country</label>
                                <input
                                  id="address.country"
                                  type="text"
                                  name="address.country"
                                  onChange={handleChange}
                                  className="form-input"
                                  value={formData.address.country}
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="phoneno">Phone Number</label>
                                <input
                                  id="phoneno"
                                  type="text"
                                  name="phoneno"
                                  onChange={handleChange}
                                  className="form-input"
                                  value={formData.phoneno}
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="email">Email</label>
                                <input
                                  id="email"
                                  type="text"
                                  name="email"
                                  onChange={handleChange}
                                  className="form-input"
                                  value={formData.email}
                                />
                              </div>
                              <div>
                                <label htmlFor="password">Password</label>{" "}
                                {/* <-- New password input */}
                                <input
                                  id="password"
                                  type="password"
                                  name="password"
                                  onChange={handleChange}
                                  className="form-input"
                                  value={formData.password}
                                  required
                                />
                              </div>
                              <button
                                type="submit"
                                className="btn btn-primary !mt-6"
                              >
                                Submit
                              </button>
                            </form>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
            {/* Pet Modal */}
            <Transition appear show={modalPet} as={Fragment}>
              <Dialog as="div" open={modalPet} onClose={closePetModal}>
                <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                  <div className="flex min-h-screen items-center justify-center px-4">
                    <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                      <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                        <div className="text-lg font-bold">Add New Pet</div>
                        <button
                          type="button"
                          className="text-white-dark hover:text-dark"
                          onClick={closePetModal}
                        >
                          <IconXCircle />
                        </button>
                      </div>

                      {/* Form to add new pet */}
                      <div className="p-5">
                        <form
                          className="space-y-5"
                          onSubmit={(e) => handlePetFormSubmit(e, false)}
                        >
                          {/* Form fields */}

                          <div>
                            <label htmlFor="name">Pet Name</label>
                            <input
                              id="name"
                              name="name"
                              type="text"
                              value={petFormData.name} // Controlled input
                              onChange={pethandleChange}
                              className="form-input"
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
                                (opt) => opt.value === petFormData.species
                              )}
                              onChange={handleSpeciesChange}
                              placeholder="Select species"
                              required
                            />
                          </div>

                          {/* Conditionally render Breed field */}
                          {petFormData.species &&
                            petFormData.species !== "Others" && (
                              <div>
                                <label htmlFor="breed">Breed</label>
                                <Select
                                  id="breed"
                                  name="breed"
                                  options={
                                    breedOptions[petFormData.species] || []
                                  }
                                  value={breedOptions[
                                    petFormData.species
                                  ]?.find(
                                    (opt) => opt.value === petFormData.breed
                                  )}
                                  onChange={(selectedOption) =>
                                    setPetFormData({
                                      ...petFormData,
                                      breed: selectedOption.value,
                                    })
                                  }
                                  placeholder={`Select ${petFormData.species} breed`}
                                  required
                                />
                              </div>
                            )}

                          {/* Render a text input for breed if "Others" is selected */}
                          {petFormData.species === "Others" && (
                            <div>
                              <label htmlFor="breed">Breed</label>
                              <input
                                id="breed"
                                name="breed"
                                type="text"
                                placeholder="Enter breed"
                                className="form-input"
                                onChange={pethandleChange}
                                value={petFormData.breed}
                              />
                            </div>
                          )}
                          <div>
                            <label htmlFor="gender">Gender</label>
                            <select
                              id="gender"
                              name="gender"
                              className="form-select"
                              value={petFormData.gender}
                              onChange={pethandleChange}
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
                              value={petFormData.date_of_birth}
                              onChange={(date) =>
                                setPetFormData({
                                  ...petFormData,
                                  date_of_birth: date[0],
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
                              value={petFormData.size_of_pet}
                              onChange={pethandleChange}
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
                              value={petFormData.aggressive}
                              onChange={pethandleChange}
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
                              onChange={pethandleChange}
                              value={petFormData.weight}
                            />
                          </div>
                          <div>
                            <label htmlFor="weight_taken_date">
                              Weight Taken Date
                            </label>
                            <Flatpickr
                              id="weight_taken_date"
                              value={petFormData.weight_taken_date}
                              onChange={(date) =>
                                setPetFormData({
                                  ...petFormData,
                                  weight_taken_date: format(
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

                          {/* Vaccination records dropdown */}
                          <div>
                            <label htmlFor="vaccination_records">
                              Vaccination
                            </label>
                            <select
                              id="vaccination_records"
                              name="vaccination_records"
                              className="form-select"
                              value={petFormData.vaccination_records}
                              onChange={pethandleChange}
                            >
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          </div>
                          {/* Vaccine name and date fields, show if vaccination_records is "Yes" */}
                          {petFormData.vaccination_records === "Yes" && (
                            <div>
                              <div>
                                <label htmlFor="vaccine_name">
                                  Vaccine Name
                                </label>
                                <input
                                  id="vaccine_name"
                                  name="vaccine_name"
                                  type="text"
                                  placeholder="Enter vaccine name"
                                  className="form-input"
                                  onChange={pethandleChange}
                                  value={petFormData.vaccine_name}
                                />
                              </div>
                              <div>
                                <label htmlFor="date_administered">
                                  Date Administered
                                </label>
                                <Flatpickr
                                  value={petFormData.date_administered}
                                  onChange={(date) =>
                                    setPetFormData({
                                      ...petFormData,
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

                          {/* Insurance policy dropdown */}
                          <div>
                            <label htmlFor="insurance_policy">
                              Insurance Policy
                            </label>
                            <select
                              id="insurance_policy"
                              name="insurance_policy"
                              className="form-select"
                              value={petFormData.insurance_policy}
                              onChange={pethandleChange}
                            >
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          </div>

                          {/* Show insurance policy fields if insurance_policy is "Yes" */}
                          {petFormData.insurance_policy === "Yes" && (
                            <div>
                              <div>
                                <label htmlFor="policy_number">
                                  Policy Number
                                </label>
                                <input
                                  id="policy_number"
                                  name="policy_number"
                                  type="text"
                                  placeholder="Enter policy number"
                                  className="form-input"
                                  onChange={pethandleChange}
                                  value={petFormData.policy_number}
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
                                  onChange={pethandleChange}
                                  value={petFormData.provider}
                                  required
                                />
                              </div>
                              <div>
                                <label htmlFor="coverage_start_date">
                                  Coverage Start Date
                                </label>
                                <Flatpickr
                                  value={petFormData.coverage_start_date}
                                  onChange={(date) =>
                                    setPetFormData({
                                      ...petFormData,
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
                                  value={petFormData.coverage_end_date}
                                  onChange={(date) =>
                                    setPetFormData({
                                      ...petFormData,
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
                                <label htmlFor="annual_limit">
                                  Annual Limit
                                </label>
                                <input
                                  id="annual_limit"
                                  name="annual_limit"
                                  type="number"
                                  placeholder="Enter annual limit"
                                  className="form-input"
                                  onChange={pethandleChange}
                                  value={petFormData.annual_limit}
                                  required
                                />
                              </div>
                              <div>
                                <label htmlFor="coverage_type">
                                  Coverage Type
                                </label>
                                <select
                                  id="coverage_type"
                                  name="coverage_type"
                                  className="form-select"
                                  value={petFormData.coverage_type}
                                  onChange={pethandleChange}
                                  required
                                >
                                  <option value="Comprehensive">
                                    Comprehensive
                                  </option>
                                  <option value="Basic">Basic</option>
                                  <option value="Accident Only">
                                    Accident Only
                                  </option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Submit button */}
                          <button
                            type="submit"
                            className="btn btn-primary !mt-6"
                          >
                            Submit
                          </button>
                        </form>
                      </div>
                    </Dialog.Panel>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </div>
          <button
            type="button"
            className="btn btn-primary my-5"
            onClick={() => getcustomeval()}
          >
            <IconPlus className="ltr:mr-2 rtl:ml-2" />
            Parents
          </button>
        </div>

        <input
          type="text"
          className="form-input w-auto"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="datatables">
        <DataTable
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={recordsData}
          columns={[
            { accessor: "name", sortable: true },
            { accessor: "address.street", title: "Street", sortable: true },
            { accessor: "address.city", title: "City", sortable: true },
            { accessor: "address.zip", title: "Zip", sortable: true },
            { accessor: "address.country", title: "Country", sortable: true },
            { accessor: "phoneno", sortable: true },
            { accessor: "email", sortable: true },
            {
              accessor: "pets",
              title: "Pets",
              sortable: false,
              render: (row) => (
                <div className="flex items-center gap-2">
                  {row.pets.length} {/* Pet count */}
                  <Tippy content="Add new pet">
                    <button
                      type="button"
                      onClick={() => handleAddPet(row.id)} // Pass the owner ID to the pet modal
                      className="btn btn-sm btn-success"
                    >
                      <IconPlus />
                    </button>
                  </Tippy>
                </div>
              ),
            },
            {
              accessor: "action",
              title: "Action",
              titleClassName: "!text-center",
              render: (row) => (
                <div className="mx-auto flex w-max items-center gap-4">
                  <Tippy content="Edit Parent">
                    <button
                      type="button"
                      onClick={() => handleUpdateClick(row.id)}
                      className="btn btn-primary bg-primary"
                    >
                      <IconPencil />
                    </button>
                  </Tippy>
                  <Tippy content="Delete Parent">
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(row.id)}
                      className="btn btn-primary bg-red-500"
                    >
                      <IconXCircle />
                    </button>
                  </Tippy>
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
          minHeight={200}
          paginationText={({ from, to, totalRecords }) =>
            `Showing ${from} to ${to} of ${totalRecords} entries`
          }
        />
      </div>

      <Transition appear show={modal2} as={Fragment}>
        <Dialog as="div" open={modal2} onClose={() => setModal2(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </Transition.Child>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  as="div"
                  className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                >
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <h5 className="text-lg font-bold">Delete</h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => setModal2(false)}
                    ></button>
                  </div>
                  <div className="p-5">
                    <p>Do you want to delete this Owner?</p>
                    <div className="mt-8 flex items-center justify-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => setModal2(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary ltr:ml-4 rtl:mr-4"
                        onClick={handleDeleteData}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ComponentsDatatablesOwner;
