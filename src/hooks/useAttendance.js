import { useState, useEffect } from "react";
import {
  fetchAttendance,
  addOrUpdateAttendance,
  updateAttendance,
} from "../services/attendanceService";
import showErrorToast from "../utils/showErrorToast";
import showInfoToast from "../utils/showInfoToast";
import generateAudio from "../utils/generateAudio";
import isSameDay from "../utils/isSameDay";

export const useAttendance = (clinicId, userId, isItStaff, setIsItStaff) => {
  const [attendance, setAttendance] = useState([]);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const attendanceData = isItStaff
          ? await fetchAttendance(clinicId, userId, isItStaff)
          : await fetchAttendance(clinicId);
        setAttendance(attendanceData);
      } catch (error) {
        console.error("Error fetching attendance:", error.message);
      }
    };

    fetchAttendanceData();
  }, [clinicId, userId, isItStaff]);

  const handleAttendance = async (
    selectedNurse,
    nurseName,
    actionType,
    showCamera,
    navigate
  ) => {
    const isCheckIn = actionType === "checkIn";
    const setLoading = isCheckIn ? setCheckInLoading : setCheckOutLoading;

    setLoading(true);
    const today = new Date();

    const nurseAttendance = attendance.find(
      (record) =>
        record.id === selectedNurse &&
        record.pastThirtyDays.some((day) =>
          isSameDay(new Date(day.datetime), today)
        )
    );

    const todayAttendance = nurseAttendance
      ? nurseAttendance.pastThirtyDays.find((day) =>
          isSameDay(new Date(day.datetime), today)
        )
      : null;

    if (isCheckIn) {
      if (todayAttendance && todayAttendance.checkInTime !== null) {
        showInfoToast("Check-in already done.");
        setLoading(false);
        return;
      }

      if (!nurseAttendance) {
        showCamera(true);
        await createOrUpdateAttendance(
          selectedNurse,
          nurseName,
          today,
          "present",
          null,
          setLoading,
          null,
          isCheckIn
        );
      }
    } else {
      if (!todayAttendance || todayAttendance.checkInTime === null) {
        showErrorToast("Please check in first for the day.");
        setLoading(false);
        return;
      }

      if (todayAttendance.checkOutTime !== null) {
        showInfoToast("Check-out already done.");
        setLoading(false);
        return;
      }

      showCamera(true);
      await createOrUpdateAttendance(
        selectedNurse,
        nurseName,
        today,
        "present",
        todayAttendance,
        setLoading,
        navigate,
        isCheckIn,
        nurseAttendance
      );
    }
  };

  const createOrUpdateAttendance = async (
    selectedNurse,
    nurseName,
    today,
    status,
    todayAttendance,
    setLoading,
    navigate = null,
    isCheckIn,
    nurseAttendance = null
  ) => {
    try {
      let attendanceData;

      if (isCheckIn) {
        attendanceData = {
          id: selectedNurse,
          datetime: today.toISOString(),
          status: status,
          nurseName: nurseName,
          checkInTime: todayAttendance
            ? todayAttendance.checkInTime
            : today.toISOString(),
          checkOutTime: todayAttendance ? today.toISOString() : null,
        };
      } else {
        todayAttendance.checkOutTime = new Date().toISOString();

        const updatedPastThirtyDays = nurseAttendance.pastThirtyDays.map(
          (day) =>
            isSameDay(new Date(day.datetime), today) ? todayAttendance : day
        );

        const updatedAttendanceData = {
          ...nurseAttendance,
          pastThirtyDays: updatedPastThirtyDays,
        };

        attendanceData = updatedAttendanceData;
      }

      const response = todayAttendance
        ? isItStaff
          ? await updateAttendance(
              clinicId,
              attendanceData,
              userId ? userId : selectedNurse,
              isItStaff
            )
          : await updateAttendance(clinicId, attendanceData, selectedNurse)
        : isItStaff
        ? await addOrUpdateAttendance(
            clinicId,
            attendanceData,
            userId,
            isItStaff
          )
        : await addOrUpdateAttendance(clinicId, attendanceData);

      if (!response) throw new Error("Failed to update attendance");

      setAttendance((prevAttendance) => {
        const existingRecordIndex = prevAttendance.findIndex(
          (record) => record.id === selectedNurse
        );

        if (existingRecordIndex !== -1) {
          return prevAttendance.map((record) =>
            record.id === selectedNurse
              ? {
                  ...record,
                  pastThirtyDays: response.pastThirtyDays,
                }
              : record
          );
        } else {
          return [
            ...prevAttendance,
            {
              id: selectedNurse,
              nurseName: nurseName,
              pastThirtyDays: response.pastThirtyDays,
            },
          ];
        }
      });

      showInfoToast(
        `${isCheckIn ? "Check-in" : "Check-out"} successfully done.`
      );
      generateAudio(
        `${nurseName}, your ${
          isCheckIn ? "check-in" : "checkout"
        } for the day has been marked successfully!`
      );

      if (!isCheckIn) {
        setTimeout(() => {
          if (isItStaff) {
            setIsItStaff(false);
          } else {
            window.history.back();
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      showErrorToast(
        `Error updating ${
          isCheckIn ? "check-in" : "check-out"
        }. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return { attendance, handleAttendance, checkInLoading, checkOutLoading };
};
