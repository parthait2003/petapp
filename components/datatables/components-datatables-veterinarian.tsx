"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { Tooltip } from "@mantine/core"; // Tooltip for clinics
import IconPlus from "@/components/icon/icon-plus";
import IconXCircle from "@/components/icon/icon-x-circle";
import IconEdit from "@/components/icon/icon-edit";
import IconTrash from "@/components/icon/icon-trash";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const ComponentsDatatablesVeterinarian = () => {
  const [modal, setModal] = useState(false); // Modal state for adding veterinarian
  const [modalEdit, setModalEdit] = useState(false); // Modal state for editing veterinarian
  const [veterinarians, setVeterinarians] = useState([]); // State to store veterinarians
  const [initialRecords, setInitialRecords] = useState([]); // Initial fetched records
  const [recordsData, setRecordsData] = useState([]); // Data to display in the table
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "name",
    direction: "asc",
  });
  const [selectedVeterinarian, setSelectedVeterinarian] = useState(null); // To store selected veterinarian for editing
  const [formData, setFormData] = useState({
    name: "",
    degree: "",
    specializations: [""], // Array to handle multiple specializations
    clinics: [
      {
        clinic_name: "",
        clinic_address: {
          street: "",
          city: "",
          zip: "",
          country: "",
        },
      },
    ],
    availableTime: {
      Monday: { start: "", end: "", notAvailable: false },
      Tuesday: { start: "", end: "", notAvailable: false },
      Wednesday: { start: "", end: "", notAvailable: false },
      Thursday: { start: "", end: "", notAvailable: false },
      Friday: { start: "", end: "", notAvailable: false },
      Saturday: { start: "", end: "", notAvailable: false },
      Sunday: { start: "", end: "", notAvailable: false },
    },
  });

  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);

  const openEditModal = (vet) => {
    setSelectedVeterinarian(vet); // Set the selected veterinarian for editing
    setFormData({
      name: vet.name,
      degree: vet.degree,
      specializations:
        vet.specialization.length > 0 ? vet.specialization : [""], // Populate specializations or set to empty
      clinics:
        vet.clinics.length > 0
          ? vet.clinics
          : [
              {
                clinic_name: "",
                clinic_address: {
                  street: "",
                  city: "",
                  zip: "",
                  country: "",
                },
              },
            ],
      availableTime: vet.availableTime || {
        Monday: { start: "", end: "", notAvailable: false },
        Tuesday: { start: "", end: "", notAvailable: false },
        Wednesday: { start: "", end: "", notAvailable: false },
        Thursday: { start: "", end: "", notAvailable: false },
        Friday: { start: "", end: "", notAvailable: false },
        Saturday: { start: "", end: "", notAvailable: false },
        Sunday: { start: "", end: "", notAvailable: false },
      },
    });
    setModalEdit(true); // Open the edit modal
  };

  const closeEditModal = () => setModalEdit(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSpecializationChange = (index, value) => {
    const newSpecializations = [...formData.specializations];
    newSpecializations[index] = value;
    setFormData({ ...formData, specializations: newSpecializations });
  };

  const handleClinicChange = (index, field, value) => {
    const newClinics = [...formData.clinics];
    newClinics[index] = {
      ...newClinics[index],
      [field]: value,
    };
    setFormData({ ...formData, clinics: newClinics });
  };

  const handleClinicAddressChange = (index, field, value) => {
    const newClinics = [...formData.clinics];
    newClinics[index] = {
      ...newClinics[index],
      clinic_address: {
        ...newClinics[index].clinic_address,
        [field]: value,
      },
    };
    setFormData({ ...formData, clinics: newClinics });
  };

  const handleAvailableTimeChange = (day, field, value) => {
    setFormData({
      ...formData,
      availableTime: {
        ...formData.availableTime,
        [day]: {
          ...formData.availableTime[day],
          [field]: value,
        },
      },
    });
  };

  const handleNotAvailableChange = (day) => {
    setFormData((prevData) => ({
      ...prevData,
      availableTime: {
        ...prevData.availableTime,
        [day]: {
          ...prevData.availableTime[day],
          notAvailable: !prevData.availableTime[day].notAvailable,
          start: "",
          end: "",
        },
      },
    }));
  };

  const addSpecialization = () => {
    setFormData({
      ...formData,
      specializations: [...formData.specializations, ""],
    });
  };

  const removeSpecialization = (index) => {
    const newSpecializations = formData.specializations.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, specializations: newSpecializations });
  };

  const addClinic = () => {
    setFormData({
      ...formData,
      clinics: [
        ...formData.clinics,
        {
          clinic_name: "",
          clinic_address: {
            street: "",
            city: "",
            zip: "",
            country: "",
          },
        },
      ],
    });
  };

  const removeClinic = (index) => {
    const newClinics = formData.clinics.filter((_, i) => i !== index);
    setFormData({ ...formData, clinics: newClinics });
  };

  const fetchVeterinarianData = async () => {
    try {
      const response = await fetch("/api/veterinarian");
      const data = await response.json();

      if (data.veterinarians && Array.isArray(data.veterinarians)) {
        setInitialRecords(data.veterinarians);
        setRecordsData(data.veterinarians.slice(0, pageSize)); // Initial page load data
      } else {
        console.error("Veterinarians data is not an array or missing.");
      }
    } catch (error) {
      console.error("Error fetching veterinarian data:", error);
    }
  };

  const handleDelete = async (vetId) => {
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
        const response = await fetch(`/api/veterinarian/${vetId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          Swal.fire(
            "Deleted!",
            "The veterinarian has been deleted.",
            "success"
          );
          fetchVeterinarianData(); // Refresh the data after deletion
        } else {
          console.error("Failed to delete veterinarian");
        }
      }
    } catch (error) {
      console.error("Error deleting veterinarian:", error);
    }
  };

  useEffect(() => {
    fetchVeterinarianData(); // Fetch data when component mounts
  }, []);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData(initialRecords.slice(from, to)); // Paginate records
  }, [page, pageSize, initialRecords]);

  const handleFormSubmit = async (event, isEdit = false) => {
    event.preventDefault();

    const filteredSpecializations = formData.specializations.filter(
      (spec) => spec.trim() !== ""
    );
    const updatedFormData = {
      ...formData,
      specialization: filteredSpecializations,
    };

    try {
      const method = isEdit ? "PUT" : "POST";
      const endpoint = isEdit
        ? `/api/veterinarian/${selectedVeterinarian._id}`
        : "/api/veterinarian";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (response.ok) {
        MySwal.fire({
          title: isEdit
            ? "Veterinarian Updated Successfully"
            : "Veterinarian Added Successfully",
          toast: true,
          position: "bottom-start",
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
        });
        fetchVeterinarianData(); // Refresh data after adding/editing
        isEdit ? closeEditModal() : closeModal();
      } else {
        console.error("Failed to save veterinarian:", await response.json());
      }
    } catch (error) {
      console.error("Error while saving veterinarian:", error);
    }
  };

  const renderSpecializations = (specializations) => {
    return (
      <div>
        {specializations.map((spec, index) => (
          <div key={index}>{spec}</div>
        ))}
      </div>
    );
  };

  const renderClinics = (clinics) => {
    return (
      <div>
        {clinics.map((clinic, index) => (
          <Tooltip
            key={index}
            label={`Address: ${clinic.clinic_address.city}, ${clinic.clinic_address.country}`}
            position="top"
            withArrow
          >
            <div>{clinic.clinic_name}</div>
          </Tooltip>
        ))}
      </div>
    );
  };

  const renderAvailableTime = (availableTime) => {
    return (
      <div>
        {Object.entries(availableTime).map(([day, timeData]) => (
          <div key={day}>
            <strong>{day}: </strong>
            {timeData.notAvailable
              ? "N/A"
              : `${timeData.start} - ${timeData.end}`}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Veterinarians
      </h5>

      {/* Button to open modal */}
      <button
        type="button"
        className="btn btn-primary my-5"
        onClick={openModal}
      >
        <IconPlus className="ltr:mr-2 rtl:ml-2" />
        Add Veterinarian
      </button>

      {/* DataTable for listing veterinarians */}
      <div className="datatables">
        <DataTable
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={recordsData}
          columns={[
            { accessor: "name", sortable: true, title: "Name" },
            { accessor: "degree", sortable: true, title: "Degree" },
            {
              accessor: "specialization",
              sortable: true,
              title: "Specialization",
              render: ({ specialization }) =>
                renderSpecializations(specialization),
            },
            {
              accessor: "clinics",
              sortable: true,
              title: "Clinic Name",
              render: ({ clinics }) => renderClinics(clinics),
            },
            {
              accessor: "availableTime",
              title: "Available Time",
              render: ({ availableTime }) => renderAvailableTime(availableTime),
            },
            {
              accessor: "actions",
              title: "Actions",
              render: (record) => (
                <div className="flex space-x-4">
                  <button
                    className="btn btn-warning"
                    onClick={() => openEditModal(record)}
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

      {/* Modal for adding a veterinarian */}
      <Transition appear show={modal} as={Fragment}>
        <Dialog as="div" open={modal} onClose={closeModal}>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                  <div className="text-lg font-bold">Add New Veterinarian</div>
                  <button
                    type="button"
                    className="text-white-dark hover:text-dark"
                    onClick={closeModal}
                  >
                    <IconXCircle />
                  </button>
                </div>

                <div className="p-5">
                  <form
                    className="space-y-5"
                    onSubmit={(e) => handleFormSubmit(e, false)}
                  >
                    <div>
                      <label htmlFor="name">Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter veterinarian's name"
                        className="form-input"
                        onChange={handleChange}
                        value={formData.name}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="degree">Degree</label>
                      <input
                        id="degree"
                        name="degree"
                        type="text"
                        placeholder="Enter veterinarian's degree"
                        className="form-input"
                        onChange={handleChange}
                        value={formData.degree}
                        required
                      />
                    </div>

                    <div>
                      <label>Specializations</label>
                      {formData.specializations.map((specialization, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 py-1"
                        >
                          <input
                            type="text"
                            placeholder="Enter specialization"
                            value={specialization}
                            onChange={(e) =>
                              handleSpecializationChange(index, e.target.value)
                            }
                            className="form-input"
                          />
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeSpecialization(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={addSpecialization}
                      >
                        Add Specialization
                      </button>
                    </div>

                    <div>
                      <label>Clinics</label>
                      {formData.clinics.map((clinic, index) => (
                        <div key={index} className="my-2 space-y-3 border p-3">
                          <div>
                            <label htmlFor="clinic_name">Clinic Name</label>
                            <input
                              id={`clinic_name_${index}`}
                              type="text"
                              placeholder="Enter clinic name"
                              value={clinic.clinic_name}
                              onChange={(e) =>
                                handleClinicChange(
                                  index,
                                  "clinic_name",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="street">Street</label>
                            <input
                              id={`street_${index}`}
                              type="text"
                              placeholder="Enter street"
                              value={clinic.clinic_address.street}
                              onChange={(e) =>
                                handleClinicAddressChange(
                                  index,
                                  "street",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="city">City</label>
                            <input
                              id={`city_${index}`}
                              type="text"
                              placeholder="Enter city"
                              value={clinic.clinic_address.city}
                              onChange={(e) =>
                                handleClinicAddressChange(
                                  index,
                                  "city",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="zip">Zip</label>
                            <input
                              id={`zip_${index}`}
                              type="text"
                              placeholder="Enter zip code"
                              value={clinic.clinic_address.zip}
                              onChange={(e) =>
                                handleClinicAddressChange(
                                  index,
                                  "zip",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="country">Country</label>
                            <input
                              id={`country_${index}`}
                              type="text"
                              placeholder="Enter country"
                              value={clinic.clinic_address.country}
                              onChange={(e) =>
                                handleClinicAddressChange(
                                  index,
                                  "country",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger mt-3"
                            onClick={() => removeClinic(index)}
                          >
                            Remove Clinic
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={addClinic}
                      >
                        Add Clinic
                      </button>
                    </div>

                    <div>
                      <label>Available Time (Daywise)</label>
                      {Object.keys(formData.availableTime).map((day) => (
                        <div key={day} className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-3">
                            <span>{day}</span>
                            <input
                              type="checkbox"
                              checked={formData.availableTime[day].notAvailable}
                              onChange={() => handleNotAvailableChange(day)}
                            />
                            <span>N/A</span>
                          </div>
                          {!formData.availableTime[day].notAvailable && (
                            <div className="flex items-center space-x-3">
                              <input
                                type="time"
                                value={formData.availableTime[day].start}
                                onChange={(e) =>
                                  handleAvailableTimeChange(
                                    day,
                                    "start",
                                    e.target.value
                                  )
                                }
                                className="form-input"
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={formData.availableTime[day].end}
                                onChange={(e) =>
                                  handleAvailableTimeChange(
                                    day,
                                    "end",
                                    e.target.value
                                  )
                                }
                                className="form-input"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

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

      {/* Modal for editing a veterinarian */}
      <Transition appear show={modalEdit} as={Fragment}>
        <Dialog as="div" open={modalEdit} onClose={closeEditModal}>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                  <div className="text-lg font-bold">Edit Veterinarian</div>
                  <button
                    type="button"
                    className="text-white-dark hover:text-dark"
                    onClick={closeEditModal}
                  >
                    <IconXCircle />
                  </button>
                </div>

                <div className="p-5">
                  <form
                    className="space-y-5"
                    onSubmit={(e) => handleFormSubmit(e, true)}
                  >
                    <div>
                      <label htmlFor="name">Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter veterinarian's name"
                        className="form-input"
                        onChange={handleChange}
                        value={formData.name}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="degree">Degree</label>
                      <input
                        id="degree"
                        name="degree"
                        type="text"
                        placeholder="Enter veterinarian's degree"
                        className="form-input"
                        onChange={handleChange}
                        value={formData.degree}
                        required
                      />
                    </div>

                    <div>
                      <label>Specializations</label>
                      {formData.specializations.map((specialization, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="text"
                            placeholder="Enter specialization"
                            value={specialization}
                            onChange={(e) =>
                              handleSpecializationChange(index, e.target.value)
                            }
                            className="form-input"
                          />
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeSpecialization(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={addSpecialization}
                      >
                        Add Specialization
                      </button>
                    </div>

                    <div>
                      <label>Clinics</label>
                      {formData.clinics.map((clinic, index) => (
                        <div key={index} className="my-2 space-y-3 border p-3">
                          <div>
                            <label htmlFor="clinic_name">Clinic Name</label>
                            <input
                              id={`clinic_name_${index}`}
                              type="text"
                              placeholder="Enter clinic name"
                              value={clinic.clinic_name}
                              onChange={(e) =>
                                handleClinicChange(
                                  index,
                                  "clinic_name",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="street">Street</label>
                            <input
                              id={`street_${index}`}
                              type="text"
                              placeholder="Enter street"
                              value={clinic.clinic_address.street}
                              onChange={(e) =>
                                handleClinicAddressChange(
                                  index,
                                  "street",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="city">City</label>
                            <input
                              id={`city_${index}`}
                              type="text"
                              placeholder="Enter city"
                              value={clinic.clinic_address.city}
                              onChange={(e) =>
                                handleClinicAddressChange(
                                  index,
                                  "city",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="zip">Zip</label>
                            <input
                              id={`zip_${index}`}
                              type="text"
                              placeholder="Enter zip code"
                              value={clinic.clinic_address.zip}
                              onChange={(e) =>
                                handleClinicAddressChange(
                                  index,
                                  "zip",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="country">Country</label>
                            <input
                              id={`country_${index}`}
                              type="text"
                              placeholder="Enter country"
                              value={clinic.clinic_address.country}
                              onChange={(e) =>
                                handleClinicAddressChange(
                                  index,
                                  "country",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger mt-3"
                            onClick={() => removeClinic(index)}
                          >
                            Remove Clinic
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={addClinic}
                      >
                        Add Clinic
                      </button>
                    </div>

                    <div>
                      <label>Available Time (Daywise)</label>
                      {Object.keys(formData.availableTime).map((day) => (
                        <div key={day} className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-3">
                            <span>{day}</span>
                            <input
                              type="checkbox"
                              checked={formData.availableTime[day].notAvailable}
                              onChange={() => handleNotAvailableChange(day)}
                            />
                            <span>N/A</span>
                          </div>
                          {!formData.availableTime[day].notAvailable && (
                            <div className="flex items-center space-x-3">
                              <input
                                type="time"
                                value={formData.availableTime[day].start}
                                onChange={(e) =>
                                  handleAvailableTimeChange(
                                    day,
                                    "start",
                                    e.target.value
                                  )
                                }
                                className="form-input"
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={formData.availableTime[day].end}
                                onChange={(e) =>
                                  handleAvailableTimeChange(
                                    day,
                                    "end",
                                    e.target.value
                                  )
                                }
                                className="form-input"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button type="submit" className="btn btn-primary !mt-6">
                      Update Veterinarian
                    </button>
                  </form>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ComponentsDatatablesVeterinarian;
