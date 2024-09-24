"use client";
import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable } from "mantine-datatable";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "@/components/icon/icon-pencil";
import IconTrash from "@/components/icon/icon-trash";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const ComponentsDatatablesService = () => {
  const [modal1, setModal1] = useState(false); // Modal state for both adding and editing
  const [editMode, setEditMode] = useState(false); // Tracks if the form is in edit mode
  const [editid, setEditid] = useState("");
  const [recordsData, setRecordsData] = useState([]); // Data for the DataTable
  const [formData, setFormData] = useState({
    services: [{ name: ""}],
    subservices: [{ name: "", regularprice: "" ,sellprice: ""}]
  });

  const [editFormData, setEditFormData] = useState({
    services: [{ name: "" }],
    subservices: [{ name: "", regularprice: "" , sellprice: ""}]
  });

  const [editId, setEditId] = useState(null); // Track the service to edit

  // Fetch all services data
  const fetchServiceData = async () => {
    try {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to load services");

      const data = await response.json();
      const formattedData = data.services.map((service) => ({
        id: service._id,
        services: service.services,
        subservices: service.subservices
      }));

      setRecordsData(formattedData);
    } catch (error) {
      MySwal.fire("Error", "Failed to load services", "error");
    }
  };

  // Add or edit a service
  const handleSubmit = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/services/${editId}` : "/api/services";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to save service");

      MySwal.fire(
        "Success",
        editMode ? "Service updated!" : "Service added!",
        "success"
      );

      fetchServiceData(); // Refresh the data after adding or editing

      setFormData({
        services: [{ name: "" }],
        subservices: [{ name: "", regularprice: "" , sellprice: ""}]
      }); // Reset form
      setModal1(false); // Close modal
      setEditMode(false); // Reset edit mode
    } catch (error) {
      MySwal.fire("Error", error.message, "error");
    }
  };

  // Open the modal for adding a new service
  const handleAddClick = () => {
    setFormData({
      services: [{ name: "" }],
      subservices: [{ name: "", regularprice: "" , sellprice: ""}]
    });
    setEditMode(false);
    setModal1(true);
  };

  // Open the modal for editing a service
  const handleEditClick = (id) => {
    const selectedService = recordsData.find((record) => record.id === id);
    if (selectedService) {
      setFormData({
        services: selectedService.services,
        subservices: selectedService.subservices
      });
      setEditId(id);
      setEditMode(true);
      setModal1(true);
    }
  };

  // Delete a service
  const handleDeleteClick = async (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteService(id);
      }
    });
  };

  const deleteService = async (id) => {
    try {
      const response = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete service");

      MySwal.fire("Deleted!", "Service deleted successfully!", "success");
      fetchServiceData(); // Refresh data after deletion
    } catch (error) {
      MySwal.fire("Error", "Failed to delete service", "error");
    }
  };

  // Handle form input changes for services
  const handleServiceChange = (index, e) => {
    const { name, value } = e.target;
    const newServices = [...formData.services];
    newServices[index][name] = value;
    setFormData({ ...formData, services: newServices });
  };

  // Handle form input changes for subservices
  const handleSubServiceChange = (index, e) => {
    const { name, value } = e.target;
    const newSubServices = [...formData.subservices];
    newSubServices[index][name] = value;
    setFormData({ ...formData, subservices: newSubServices });
  };

  const handleAddServiceRow = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { name: ""}]
    }));
  };

  const handleAddSubServiceRow = () => {
    setFormData((prev) => ({
      ...prev,
      subservices: [...prev.subservices, { name: "", regularprice: "", sellprice: "" }]
    }));
  };

  const handleRemoveServiceRow = (index) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, services: newServices }));
  };

  const handleRemoveSubServiceRow = (index) => {
    const newSubServices = formData.subservices.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, subservices: newSubServices }));
  };

  useEffect(() => {
    fetchServiceData();
  }, []);

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Services
      </h5>

      <button className="btn btn-primary mb-4" onClick={handleAddClick}>
        <IconPlus /> Add Service
      </button>

      <DataTable
        records={recordsData}
        columns={[
          {
            accessor: "serviceNames",
            title: "Service Name",
            render: (row) =>
              row.services.map((service) => service.name).join(", ")
          },
         
          {
            accessor: "subserviceNames",
            title: "Subservice Name",
            render: (row) =>
              row.subservices.map((subservice) => subservice.name).join(", ")
          },
          {
            accessor: "subserviceregularprices",
            title: "Regularprice",
            render: (row) =>
              row.subservices.map((subservice) => subservice.regularprice).join(", ")
          },
          {
            accessor: "subservicesellprices",
            title: "Sellprice",
            render: (row) =>
              row.subservices.map((subservice) => subservice.sellprice).join(", ")
          },
          {
            accessor: "actions",
            title: "Actions",
            render: (row) => (
              <div className="flex space-x-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleEditClick(row.id)}
                >
                  <IconPencil />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteClick(row.id)}
                >
                  <IconTrash />
                </button>
              </div>
            )
          }
        ]}
      />

      {/* Modal for Adding/Editing Services */}
      <Transition appear show={modal1} as={Fragment}>
        <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
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
                <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <div className="text-lg font-bold">
                      {editMode ? "Edit Service" : "Add Service"}
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
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                      className="space-y-5"
                    >
                      <div>
                        <label htmlFor="services">Services</label>
                        {formData.services.map((service, index) => (
                          <div key={index} className="mt-2 flex space-x-2">
                            <input
                              type="text"
                              name="name"
                              placeholder="Service Name"
                              value={service.name}
                              onChange={(e) => handleServiceChange(index, e)}
                              className="form-input"
                            />
                           
                            <button
                              type="button"
                              onClick={() => handleRemoveServiceRow(index)}
                              className="btn btn-sm btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddServiceRow}
                          className="btn btn-secondary mt-2"
                        >
                          Add Service
                        </button>
                      </div>

                      <div>
                        <label htmlFor="subservices">Subservices</label>
                        {formData.subservices.map((subservice, index) => (
                          <div key={index} className="mt-2 flex space-x-2">
                            <input
                              type="text"
                              name="name"
                              placeholder="Subservice Name"
                              value={subservice.name}
                              onChange={(e) => handleSubServiceChange(index, e)}
                              className="form-input"
                            />
                            <input
                              type="number"
                              name="regularprice"
                              placeholder="Regularprice"
                              value={subservice.regularprice}
                              onChange={(e) => handleSubServiceChange(index, e)}
                              className="form-input"
                            />
                             <input
                              type="number"
                              name="sellprice"
                              placeholder="Sellprice"
                              value={subservice.sellprice}
                              onChange={(e) => handleSubServiceChange(index, e)}
                              className="form-input"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSubServiceRow(index)}
                              className="btn btn-sm btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddSubServiceRow}
                          className="btn btn-secondary mt-2"
                        >
                          Add Subservice
                        </button>
                      </div>

                      <button type="submit" className="btn btn-primary mt-6">
                        {editMode ? "Update" : "Submit"}
                      </button>
                    </form>
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

export default ComponentsDatatablesService;
