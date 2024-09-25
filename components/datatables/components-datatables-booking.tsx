"use client";

import { useEffect, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import {
  Button,
  ActionIcon,
  Modal,
  Select,
  Textarea,
  Rating,
} from "@mantine/core";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Importing FontAwesome icons
import Link from "next/link";
import sortBy from "lodash/sortBy";
import IconTrash from "@/components/icon/icon-trash";
import Swal from "sweetalert2";
import { Dialog, Transition } from "@headlessui/react";

const ComponentsDatatablesBooking = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [status, setStatus] = useState("");
  const [initialRecords, setInitialRecords] = useState([]); // Initial fetched records
  const [recordsData, setRecordsData] = useState([]); // Data to display in the table
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "bookingDate",
    direction: "asc",
  });
  const [rating, setRating] = useState(0); // Star rating state
  const [feedback, setFeedback] = useState(""); // Feedback comment state

  // Fetch booking data from the API
  const fetchBookingData = async () => {
    try {
      const response = await fetch("/api/booking");
      const data = await response.json();

      if (data.bookings && Array.isArray(data.bookings)) {
        // Fetch owner and pet names for each booking
        const bookingsWithNames = await Promise.all(
          data.bookings.map(async (booking) => {
            try {
              const ownerResponse = await fetch(`/api/owner/${booking.ownerId}`);
              const ownerData = await ownerResponse.json();

              const petResponse = await fetch(`/api/pet/${booking.petId}`);
              const petData = await petResponse.json();

              // Handle cases where owner or pet data is missing
              if (!ownerData.owner) {
                console.error(`Owner data is missing for booking: ${booking._id}`);
              }

              if (!petData.pet) {
                console.error(`Pet data is missing for booking: ${booking._id}`);
              }

              return {
                ...booking,
                ownerName: ownerData?.owner?.name || 'Unknown Owner',
                petName: petData?.pet?.name || 'Unknown Pet',
                questions: booking?.questions || {}, // Ensure questions field is always an object
              };
            } catch (error) {
              console.error("Error fetching owner or pet data:", error);
              return {
                ...booking,
                ownerName: "Unknown Owner",
                petName: "Unknown Pet",
                questions: {}, // Set default questions object to avoid undefined errors
              };
            }
          })
        );

        // Sort bookings by bookingDate
        const sortedBookings = sortBy(bookingsWithNames, "bookingDate");
        setInitialRecords(sortedBookings);
        setRecordsData(sortedBookings.slice(0, pageSize)); // Paginate data on initial load
      } else {
        console.error("Bookings data is not an array or missing.");
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

  useEffect(() => {
    fetchBookingData(); // Fetch booking data on component mount
  }, []);

  // Handle pagination
  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData(initialRecords.slice(from, to)); // Paginate records
  }, [page, pageSize, initialRecords]);

  // Handle delete action
  const handleDelete = async (id) => {
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
        const response = await fetch(`/api/booking/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          Swal.fire("Deleted!", "The booking has been deleted.", "success");
          fetchBookingData(); // Refresh the data after deletion
        } else {
          console.error("Failed to delete booking");
        }
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setStatus(booking.status); // Ensure the initial status is set correctly
    console.log("Selected booking status:", booking.status);
    setIsEditModalOpen(true);
  };

  // Handle save action
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/booking/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }), // Send the updated status to the backend
      });

      if (response.ok) {
        setIsEditModalOpen(false);

        // If the status is 'completed', open feedback modal
        if (status === "completed") {
          setIsFeedbackModalOpen(true);
        } else {
          Swal.fire("Updated!", "The booking status has been updated.", "success");
          fetchBookingData(); // Refresh the data after update
        }
      } else {
        console.error("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  // Handle feedback submit
  const handleFeedbackSubmit = async () => {
    try {
      const response = await fetch(`/api/booking/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed", // Ensure the status is "completed"
          rating, // Send the selected rating
          feedback, // Send the feedback provided by the user
        }),
      });

      if (response.ok) {
        Swal.fire("Thank you!", "Your feedback has been submitted.", "success");
        setIsFeedbackModalOpen(false); // Close the feedback modal
        fetchBookingData(); // Refresh the bookings data
      } else {
        const data = await response.json();
        Swal.fire("Error", data.message || "Failed to submit feedback.", "error");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Swal.fire("Error", "Failed to submit feedback.", "error");
    }
  };

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Bookings
      </h5>

      {/* Add Booking Button */}
      <div className="mb-4 flex justify-end">
        <Link href="/addbooking" passHref>
          <Button leftIcon={<FaPlus />}>Add Booking</Button>
        </Link>
      </div>

      {/* DataTable for displaying booking records */}
      <div className="datatables">
        <DataTable
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={recordsData}
          columns={[
            { accessor: "selectedService", sortable: true, title: "Service" },
            {
              accessor: "selectedSubService",
              sortable: true,
              title: "Sub Service",
            },
            {
              accessor: "bookingDate",
              sortable: true,
              title: "Booking Date",
              render: (record) => record.bookingDate,
            },
            { accessor: "selectedTimeSlot", title: "Time Slot" },
            { accessor: "status", title: "Status" },
            { accessor: "rating", title: "Rating" },
            { accessor: "feedback", title: "Feedback" },
            {
              accessor: "ownerName",
              title: "Owner",
              render: (record) => record.ownerName,
            },
            {
              accessor: "petName",
              title: "Pet",
              render: (record) => record.petName,
            },
            {
              accessor: "questions.eats",
              title: "Eats",
              render: (record) =>
                record.questions?.eats === "yes" ? "Yes" : "No",
            },
            {
              accessor: "questions.vaccinationCard",
              title: "Vaccination Card",
              render: (record) =>
                record.questions?.vaccinationCard === "yes" ? "Yes" : "No",
            },
            {
              accessor: "questions.illness",
              title: "Illness",
              render: (record) =>
                record.questions?.illness === "yes" ? "Yes" : "No",
            },
            {
              accessor: "questions.allergy",
              title: "Allergy",
              render: (record) =>
                record.questions?.allergy === "yes" ? "Yes" : "No",
            },
            {
              accessor: "transactionId",
              title: "transactionId",
              render: (record) => record.transactionId,
            },
            {
              accessor: "paymentstatus",
              title: "paymentStatus",
              render: (record) => record.paymentstatus,
            },
            {
              accessor: "regularprice",
              title: "regularPrice",
              render: (record) => record.regularprice,
            },
            {
              accessor: "sellprice",
              title: "sellPrice",
              render: (record) => record.sellprice,
            },
            {
              accessor: "actions",
              title: "Actions",
              render: (record) => (
                <div className="flex items-center gap-2">
                  {/* Edit Link */}
                  {/* Edit Modal */}
                  <Modal
                    opened={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Edit Booking Status"
                  >
                    <Select
                      label="Status"
                      placeholder="Select status"
                      value={status}
                      onChange={setStatus} // This updates the state with the new status
                      data={[
                        { value: "pending", label: "Pending" },
                        { value: "confirmed", label: "Confirmed" },
                        { value: "cancelled", label: "Cancelled" },
                        { value: "completed", label: "Completed" },
                      ]}
                    />

                    <Button onClick={handleSave} className="mt-4">
                      Save
                    </Button>
                  </Modal>

                  {/* Edit Button */}
                  <ActionIcon
                    color="blue"
                    onClick={() => handleEditClick(record)}
                  >
                    <FaEdit />
                  </ActionIcon>

                  {/* Delete Button */}
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

      {/* Feedback Modal */}
      <Modal
        opened={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Booking Feedback"
      >
        <div>
          <label htmlFor="rating">Rate the Service:</label>
          <Rating value={rating} onChange={setRating} />

          <Textarea
            label="Comments"
            placeholder="Share your feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            minRows={3}
          />

          <Button onClick={handleFeedbackSubmit} className="mt-4">
            Submit Feedback
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ComponentsDatatablesBooking;
