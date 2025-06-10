"use client";
import { useEffect, useRef, useState } from "react";

export default function VillageMap() {
  const [markers, setMarkers] = useState([]);
  const [zones, setZones] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showEditMarkerModal, setShowEditMarkerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({ name: "", group: "", color: "red" });
  const [editMarkerData, setEditMarkerData] = useState(null);
  const [originalMarkerData, setOriginalMarkerData] = useState(null);
  const [zoneFormData, setZoneFormData] = useState({ name: "", color: "blue" });
  const [draggedMarker, setDraggedMarker] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelectingZone, setIsSelectingZone] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [mouseDownStart, setMouseDownStart] = useState(null);
  const [mouseDownTime, setMouseDownTime] = useState(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [visibleZones, setVisibleZones] = useState({});
  const [draggedZone, setDraggedZone] = useState(null);
  const [isDraggingZone, setIsDraggingZone] = useState(false);
  const [isResizingZone, setIsResizingZone] = useState(false);
  const [isRotatingZone, setIsRotatingZone] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [originalZoneState, setOriginalZoneState] = useState(null);
  const [rotationStartAngle, setRotationStartAngle] = useState(0);
  const [draggedListMarker, setDraggedListMarker] = useState(null);
  const [dragOverZoneId, setDragOverZoneId] = useState(null);
  const [markerSizes, setMarkerSizes] = useState({});
  const imageRef = useRef(null);
  const [showEditZoneModal, setShowEditZoneModal] = useState(false);
  const [editZoneData, setEditZoneData] = useState(null);
  const [originalZoneData, setOriginalZoneData] = useState(null);

  // สีและชื่อสี
  const colorOptions = [
    { value: "red", label: "แดง", bg: "bg-red-500", hover: "hover:bg-red-600" },
    { value: "yellow", label: "เหลือง", bg: "bg-yellow-500", hover: "hover:bg-yellow-600" },
    { value: "green", label: "เขียว", bg: "bg-green-500", hover: "hover:bg-green-600" },
    { value: "blue", label: "น้ำเงิน", bg: "bg-blue-500", hover: "hover:bg-blue-600" },
    { value: "pink", label: "ชมพู", bg: "bg-pink-500", hover: "hover:bg-pink-600" },
    { value: "indigo", label: "คราม", bg: "bg-indigo-500", hover: "hover:bg-indigo-600" },
    { value: "teal", label: "เขียวหัวเป็ด", bg: "bg-teal-500", hover: "hover:bg-teal-600" }
  ];

  const zoneColorOptions = [
    { value: "blue", label: "น้ำเงิน", bg: "bg-blue-500", border: "border-blue-500", bgOpacity: "bg-blue-200" },
    { value: "purple", label: "ม่วง", bg: "bg-purple-500", border: "border-purple-500", bgOpacity: "bg-purple-200" },
    { value: "orange", label: "ส้ม", bg: "bg-orange-500", border: "border-orange-500", bgOpacity: "bg-orange-200" },
    { value: "emerald", label: "มรกต", bg: "bg-emerald-500", border: "border-emerald-500", bgOpacity: "bg-emerald-200" },
    { value: "rose", label: "กุหลาบ", bg: "bg-rose-500", border: "border-rose-500", bgOpacity: "bg-rose-200" },
    { value: "cyan", label: "ฟ้า", bg: "bg-cyan-500", border: "border-cyan-500", bgOpacity: "bg-cyan-200" },
    { value: "amber", label: "อำพัน", bg: "bg-amber-500", border: "border-amber-500", bgOpacity: "bg-amber-200" }
  ];

  // ระยะทางขั้นต่ำที่ถือว่าเป็นการลาก (pixels)
  const DRAG_THRESHOLD = 5;

  // เพิ่มค่าเริ่มต้นขนาด marker
  const DEFAULT_MARKER_SIZE = 6; // ขนาดเริ่มต้น 24px (6 * 4)
  const MIN_MARKER_SIZE = 1; // ขนาดต่ำสุด 16px
  const MAX_MARKER_SIZE = 16; // ขนาดสูงสุด 48px

  // ตรวจสอบว่าจุดอยู่ในกลุ่มหรือไม่
  const isPointInZone = (x, y, zone) => {
    return x >= zone.x && x <= zone.x + zone.width && y >= zone.y && y <= zone.y + zone.height;
  };

  // หากลุ่มที่ marker อยู่
  const findMarkerZone = marker => {
    return zones.find(zone => isPointInZone(marker.x, marker.y, zone));
  };

  // คำนวณระยะทางระหว่างสองจุด
  const getDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // อัพเดทกลุ่มของ marker เมื่อตำแหน่งเปลี่ยน
  useEffect(
    () => {
      setMarkers(prevMarkers =>
        prevMarkers.map(marker => {
          const zone = findMarkerZone(marker);
          return zone ? { ...marker, group: zone.name } : marker;
        })
      );
    },
    [zones]
  );

  // เมื่อสร้างกลุ่มใหม่ให้กำหนดค่าเริ่มต้นเป็นแสดง
  useEffect(
    () => {
      const newVisibleZones = {};
      zones.forEach(zone => {
        if (visibleZones[zone.id] === undefined) {
          newVisibleZones[zone.id] = true;
        }
      });
      setVisibleZones({ ...visibleZones, ...newVisibleZones });
    },
    [zones]
  );

  // หาจุดกึ่งกลางของกลุ่ม
  const getZoneCenter = zone => {
    return {
      x: zone.x + zone.width / 2,
      y: zone.y + zone.height / 2
    };
  };

  // จัดการการคลิกที่ภาพ (สร้าง marker)
  const handleImageClick = e => {
    if (isDragging || hasDragged) {
      setHasDragged(false);
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // ตรวจสอบว่าจุดที่คลิกอยู่ในกลุ่มใดหรือไม่
    const clickedZone = zones.find(zone => !zone.isDefault && isPointInZone(x, y, zone));

    setCurrentPosition({ x, y });
    setShowPopup(true);
    setFormData({
      name: "",
      group: clickedZone ? clickedZone.name : "Marker",
      color: "red"
    });
  };

  // จัดการการส่งฟอร์ม marker
  const handleSubmit = e => {
    e.preventDefault();

    if (formData.name) {
      const newMarker = {
        id: Date.now(),
        x: currentPosition.x,
        y: currentPosition.y,
        originalX: currentPosition.x,
        originalY: currentPosition.y,
        name: formData.name,
        group: formData.group,
        color: formData.color
      };

      setMarkers([...markers, newMarker]);
      setShowPopup(false);
      setFormData({ name: "", group: "", color: "red" });
    }
  };

  // จัดการการส่งฟอร์มกลุ่ม
  const handleZoneSubmit = e => {
    e.preventDefault();

    if (zoneFormData.name && currentSelection) {
      const newZone = {
        id: Date.now(),
        name: zoneFormData.name,
        color: zoneFormData.color,
        x: Math.min(currentSelection.startX, currentSelection.endX),
        y: Math.min(currentSelection.startY, currentSelection.endY),
        width: Math.abs(currentSelection.endX - currentSelection.startX),
        height: Math.abs(currentSelection.endY - currentSelection.startY),
        rotation: 0
      };

      setZones([...zones, newZone]);
      setShowZoneModal(false);
      setZoneFormData({ name: "", color: "blue" });
      setVisibleZones({ ...visibleZones, [newZone.id]: true });
    }
  };

  // ปิด popup
  const closePopup = () => {
    setShowPopup(false);
    setFormData({ name: "", group: "", color: "red" });
  };

  // ปิด zone modal
  const closeZoneModal = () => {
    setShowZoneModal(false);
    setZoneFormData({ name: "", color: "blue" });
  };

  // ลบ marker
  const removeMarker = markerId => {
    setMarkers(markers.filter(marker => marker.id !== markerId));
  };

  // ลบกลุ่ม
  const removeZone = zoneId => {
    setZones(zones.filter(zone => zone.id !== zoneId));
  };

  // reset marker กลับตำแหน่งเดิม
  const resetMarkerPosition = markerId => {
    setMarkers(prevMarkers =>
      prevMarkers.map(marker =>
        marker.id === markerId
          ? {
              ...marker,
              x: marker.originalX,
              y: marker.originalY,
              group: findMarkerZone({ x: marker.originalX, y: marker.originalY })?.name || "Marker"
            }
          : marker
      )
    );
  };

  // จัดการการ double click ที่ marker
  const handleMarkerDoubleClick = (e, marker) => {
    e.preventDefault();
    e.stopPropagation();

    const markerData = {
      id: marker.id,
      name: marker.name,
      group: marker.group || "Marker",
      color: marker.color,
      size: markerSizes[marker.id] || DEFAULT_MARKER_SIZE,
      x: marker.x,
      y: marker.y
    };

    setOriginalMarkerData(markerData);
    setEditMarkerData(markerData);
    setShowEditMarkerModal(true);
  };

  // จัดการการ mouse down ที่ marker
  const handleMarkerMouseDown = (e, marker) => {
    // ถ้าเป็น double click ไม่ต้องเริ่มการลาก
    if (e.detail === 2) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setDraggedMarker(marker);
    setIsDragging(true);
  };

  // จัดการการเคลื่อนไหวของเมาส์สำหรับลาก marker
  const handleMarkerMove = e => {
    if (!draggedMarker || !isDragging) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    setMarkers(
      markers.map(marker => {
        if (marker.id === draggedMarker.id) {
          const updatedMarker = { ...marker, x, y };
          // หากลุ่มใหม่
          const zone = findMarkerZone(updatedMarker);
          if (zone) {
            updatedMarker.group = zone.name;
          }
          return updatedMarker;
        }
        return marker;
      })
    );
  };

  // เริ่มการตรวจจับการลาก
  const handleImageMouseDown = e => {
    if (isDragging) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMouseDownStart({ x, y });
    setMouseDownTime(Date.now());
    setHasDragged(false);
  };

  // หาสีของ marker
  const getMarkerColors = color => {
    const colorMap = {
      red: { bg: "bg-red-500", hover: "hover:bg-red-600" },
      yellow: { bg: "bg-yellow-500", hover: "hover:bg-yellow-600" },
      green: { bg: "bg-green-500", hover: "hover:bg-green-600" },
      blue: { bg: "bg-blue-500", hover: "hover:bg-blue-600" },
      pink: { bg: "bg-pink-500", hover: "hover:bg-pink-600" },
      indigo: { bg: "bg-indigo-500", hover: "hover:bg-indigo-600" },
      teal: { bg: "bg-teal-500", hover: "hover:bg-teal-600" }
    };
    return colorMap[color] || colorMap.red;
  };

  // แปลงสี Tailwind เป็นสี RGB
  const colorMap = {
    red: "#EF4444", // bg-red-500
    yellow: "#F59E0B", // bg-yellow-500
    green: "#10B981", // bg-green-500
    blue: "#3B82F6", // bg-blue-500
    pink: "#EC4899", // bg-pink-500
    indigo: "#6366F1", // bg-indigo-500
    teal: "#14B8A6" // bg-teal-500
  };

  // หาสีของกลุ่ม
  const getZoneColors = color => {
    const colorMap = {
      blue: { bg: "bg-blue-500", border: "border-blue-500", bgOpacity: "bg-blue-200" },
      purple: { bg: "bg-purple-500", border: "border-purple-500", bgOpacity: "bg-purple-200" },
      orange: { bg: "bg-orange-500", border: "border-orange-500", bgOpacity: "bg-orange-200" },
      emerald: { bg: "bg-emerald-500", border: "border-emerald-500", bgOpacity: "bg-emerald-200" },
      rose: { bg: "bg-rose-500", border: "border-rose-500", bgOpacity: "bg-rose-200" },
      cyan: { bg: "bg-cyan-500", border: "border-cyan-500", bgOpacity: "bg-cyan-200" },
      amber: { bg: "bg-amber-500", border: "border-amber-500", bgOpacity: "bg-amber-200" }
    };
    return colorMap[color] || colorMap.blue;
  };

  // สลับการแสดง/ซ่อนกลุ่ม
  const toggleZoneVisibility = zoneId => {
    setVisibleZones({
      ...visibleZones,
      [zoneId]: !visibleZones[zoneId]
    });
  };

  // บันทึกการแก้ไข marker
  const handleEditMarkerSubmit = e => {
    e.preventDefault();
    if (editMarkerData) {
      setMarkers(prevMarkers =>
        prevMarkers.map(marker => {
          if (marker.id === editMarkerData.id) {
            if (marker.group !== editMarkerData.group) {
              const newZone = zones.find(zone => zone.name === editMarkerData.group);
              if (newZone) {
                const center = getZoneCenter(newZone);
                return {
                  ...marker,
                  ...editMarkerData,
                  x: center.x,
                  y: center.y,
                  originalX: center.x,
                  originalY: center.y
                };
              }
            }
            return { ...marker, ...editMarkerData };
          }
          return marker;
        })
      );

      setMarkerSizes(prev => ({
        ...prev,
        [editMarkerData.id]: editMarkerData.size
      }));

      setShowEditMarkerModal(false);
      setEditMarkerData(null);
      setOriginalMarkerData(null);
    }
  };

  // เพิ่มฟังก์ชันสำหรับการลากกลุ่ม
  const handleZoneMouseDown = (e, zone, handle = null) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = imageRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (handle === "rotate") {
      setIsRotatingZone(true);
      const center = {
        x: zone.x + zone.width / 2,
        y: zone.y + zone.height / 2
      };
      setRotationStartAngle(calculateAngle(center, { x: mouseX, y: mouseY }) - (zone.rotation || 0));
    } else {
      setOriginalZoneState({
        offsetX: mouseX - zone.x,
        offsetY: mouseY - zone.y,
        initialX: zone.x,
        initialY: zone.y,
        initialWidth: zone.width,
        initialHeight: zone.height,
        rotation: zone.rotation || 0
      });

      if (handle) {
        setIsResizingZone(true);
        setResizeHandle(handle);
      } else {
        setIsDraggingZone(true);
      }
    }
    setDraggedZone(zone);
  };

  // อัพเดทการจัดการ mouse move
  const handleMouseMove = e => {
    if (isDragging) {
      handleMarkerMove(e);
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const mouseY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    if (isRotatingZone && draggedZone) {
      const center = {
        x: draggedZone.x + draggedZone.width / 2,
        y: draggedZone.y + draggedZone.height / 2
      };
      const currentAngle = calculateAngle(center, { x: mouseX, y: mouseY }) - rotationStartAngle;

      setZones(prevZones => prevZones.map(zone => (zone.id === draggedZone.id ? { ...zone, rotation: currentAngle } : zone)));
      return;
    }

    if (isDraggingZone && draggedZone && originalZoneState) {
      const rect = imageRef.current.getBoundingClientRect();
      const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const mouseY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

      setZones(prevZones =>
        prevZones.map(zone =>
          zone.id === draggedZone.id
            ? {
                ...zone,
                x: mouseX - originalZoneState.offsetX,
                y: mouseY - originalZoneState.offsetY
              }
            : zone
        )
      );
      return;
    }

    if (isResizingZone && draggedZone && originalZoneState) {
      setZones(prevZones =>
        prevZones.map(zone => {
          if (zone.id === draggedZone.id) {
            let newZone = { ...zone };
            const minSize = 50;

            // คำนวณขอบเขตสูงสุดและต่ำสุด
            const originalLeft = originalZoneState.initialX;
            const originalTop = originalZoneState.initialY;
            const originalRight = originalLeft + originalZoneState.initialWidth;
            const originalBottom = originalTop + originalZoneState.initialHeight;

            // ฟังก์ชันสำหรับคำนวณการย่อขยายและกลับด้าน
            const calculateReversibleDimension = (mousePos, fixedPos, isStart) => {
              const distance = mousePos - fixedPos;
              const isReversed = isStart ? distance < 0 : distance < minSize;

              if (isReversed) {
                // กลับด้าน
                return {
                  start: isStart ? fixedPos + distance : fixedPos,
                  size: Math.abs(distance)
                };
              } else {
                // ปกติ
                return {
                  start: isStart ? mousePos : fixedPos,
                  size: Math.abs(distance)
                };
              }
            };

            switch (resizeHandle) {
              case "n": {
                const result = calculateReversibleDimension(mouseY, originalBottom, true);
                newZone.y = result.start;
                newZone.height = result.size;
                break;
              }
              case "s": {
                const result = calculateReversibleDimension(mouseY, originalTop, false);
                newZone.y = result.start;
                newZone.height = result.size;
                break;
              }
              case "e": {
                const result = calculateReversibleDimension(mouseX, originalLeft, false);
                newZone.x = result.start;
                newZone.width = result.size;
                break;
              }
              case "w": {
                const result = calculateReversibleDimension(mouseX, originalRight, true);
                newZone.x = result.start;
                newZone.width = result.size;
                break;
              }
              case "ne": {
                const vertical = calculateReversibleDimension(mouseY, originalBottom, true);
                const horizontal = calculateReversibleDimension(mouseX, originalLeft, false);
                newZone.y = vertical.start;
                newZone.height = vertical.size;
                newZone.x = horizontal.start;
                newZone.width = horizontal.size;
                break;
              }
              case "nw": {
                const vertical = calculateReversibleDimension(mouseY, originalBottom, true);
                const horizontal = calculateReversibleDimension(mouseX, originalRight, true);
                newZone.y = vertical.start;
                newZone.height = vertical.size;
                newZone.x = horizontal.start;
                newZone.width = horizontal.size;
                break;
              }
              case "se": {
                const vertical = calculateReversibleDimension(mouseY, originalTop, false);
                const horizontal = calculateReversibleDimension(mouseX, originalLeft, false);
                newZone.y = vertical.start;
                newZone.height = vertical.size;
                newZone.x = horizontal.start;
                newZone.width = horizontal.size;
                break;
              }
              case "sw": {
                const vertical = calculateReversibleDimension(mouseY, originalTop, false);
                const horizontal = calculateReversibleDimension(mouseX, originalRight, true);
                newZone.y = vertical.start;
                newZone.height = vertical.size;
                newZone.x = horizontal.start;
                newZone.width = horizontal.size;
                break;
              }
            }

            // ตรวจสอบขนาดขั้นต่ำ
            if (newZone.width < minSize || newZone.height < minSize) {
              return zone;
            }

            return newZone;
          }
          return zone;
        })
      );
      return;
    }

    // จัดการการเลือกกลุ่มใหม่
    if (mouseDownStart) {
      const rect = imageRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const distance = getDistance(mouseDownStart, { x: currentX, y: currentY });

      if (distance >= DRAG_THRESHOLD && !isSelectingZone) {
        setIsSelectingZone(true);
        setSelectionStart(mouseDownStart);
        setHasDragged(true);
      }

      if (isSelectingZone) {
        const x = Math.max(0, Math.min(currentX, rect.width));
        const y = Math.max(0, Math.min(currentY, rect.height));
        setSelectionEnd({ x, y });
      }
    }
  };

  // อัพเดทการจัดการ mouse up
  const handleMouseUp = () => {
    if (isDraggingZone || isResizingZone || isRotatingZone) {
      setIsDraggingZone(false);
      setIsResizingZone(false);
      setIsRotatingZone(false);
      setDraggedZone(null);
      setResizeHandle(null);
      setOriginalZoneState(null);
      setRotationStartAngle(0);
    }

    if (isDragging) {
      const draggedMarkerData = markers.find(m => m.id === draggedMarker.id);
      if (draggedMarkerData) {
        // ตรวจสอบว่า marker อยู่ในพื้นที่ของกลุ่มใดหรือไม่
        const newZone = zones.find(zone => isPointInZone(draggedMarkerData.x, draggedMarkerData.y, zone));

        // อัพเดทกลุ่มของ marker
        setMarkers(prevMarkers =>
          prevMarkers.map(marker =>
            marker.id === draggedMarker.id ? { ...marker, group: newZone ? newZone.name : "Marker" } : marker
          )
        );
      }
      setDraggedMarker(null);
      setIsDragging(false);
    }

    if (isSelectingZone && selectionStart && selectionEnd && hasDragged) {
      const distance = getDistance(selectionStart, selectionEnd);

      if (distance >= DRAG_THRESHOLD) {
        setCurrentSelection({
          startX: selectionStart.x,
          startY: selectionStart.y,
          endX: selectionEnd.x,
          endY: selectionEnd.y
        });
        setShowZoneModal(true);
      }

      setIsSelectingZone(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    }

    setMouseDownStart(null);
    setMouseDownTime(null);

    setTimeout(() => {
      setHasDragged(false);
    }, 100);
  };

  // เพิ่มฟังก์ชันสำหรับการลาก marker ในรายการ
  const handleMarkerDragStart = (e, marker) => {
    e.stopPropagation();
    setDraggedListMarker(marker);
  };

  const handleMarkerDragEnd = () => {
    setDraggedListMarker(null);
    setDragOverZoneId(null);
  };

  const handleZoneDragOver = (e, zone) => {
    e.preventDefault();
    setDragOverZoneId(zone.id);
  };

  const handleZoneDragLeave = () => {
    setDragOverZoneId(null);
  };

  const handleZoneDrop = (e, targetZone) => {
    e.preventDefault();
    if (draggedListMarker && targetZone.name !== draggedListMarker.group) {
      // คำนวณจุดกึ่งกลางของกลุ่มเป้าหมาย
      const center = getZoneCenter(targetZone);

      // อัพเดท marker
      setMarkers(prevMarkers =>
        prevMarkers.map(marker =>
          marker.id === draggedListMarker.id
            ? {
                ...marker,
                group: targetZone.name,
                x: center.x,
                y: center.y,
                originalX: center.x,
                originalY: center.y
              }
            : marker
        )
      );
    }
    setDraggedListMarker(null);
    setDragOverZoneId(null);
  };

  // เพิ่มฟังก์ชันสำหรับการปรับขนาด marker
  const handleMarkerSizeChange = (markerId, newSize) => {
    setMarkerSizes(prev => ({
      ...prev,
      [markerId]: Math.max(MIN_MARKER_SIZE, Math.min(MAX_MARKER_SIZE, newSize))
    }));
  };

  // เพิ่ม Component สำหรับวาดรูปทรงด้วย Canvas
  const MarkerShape = ({ shape, color, size, className = "" }) => {
    const canvasRef = useRef(null);

    useEffect(
      () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const scale = window.devicePixelRatio || 1;

        // กำหนดขนาด canvas ตาม scale เพื่อความคมชัด
        canvas.width = size * scale;
        canvas.height = size * scale;
        ctx.scale(scale, scale);

        // ตั้งค่าสไตล์พื้นฐาน
        ctx.fillStyle = color;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;

        // ล้าง canvas
        ctx.clearRect(0, 0, size, size);

        // วาดรูปทรงตามที่กำหนด
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = (size - 4) / 2; // ลดขนาดเล็กน้อยเพื่อให้มีขอบ

        switch (shape) {
          case "circle":
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;

          case "square":
            ctx.beginPath();
            ctx.rect(2, 2, size - 4, size - 4);
            ctx.fill();
            ctx.stroke();
            break;

          case "triangle":
            ctx.beginPath();
            ctx.moveTo(centerX, 2);
            ctx.lineTo(size - 2, size - 2);
            ctx.lineTo(2, size - 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case "star":
            ctx.beginPath();
            const outerRadius = radius;
            const innerRadius = radius * 0.4;

            for (let i = 0; i < 10; i++) {
              const r = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = (i * Math.PI) / 5 - Math.PI / 2;
              const x = centerX + r * Math.cos(angle);
              const y = centerY + r * Math.sin(angle);

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }

            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }

        // เพิ่มเงา
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      },
      [shape, color, size]
    );

    return (
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={`${className} transition-transform duration-200`}
        style={{
          width: size,
          height: size
        }}
      />
    );
  };

  // อัพเดทฟังก์ชัน renderMarker
  const renderMarker = (marker, isOnMap = true) => {
    const isEditing = editMarkerData?.id === marker.id;
    const displayMarker = isEditing ? editMarkerData : marker;
    const markerColors = getMarkerColors(displayMarker.color);
    const size = isEditing ? displayMarker.size : markerSizes[displayMarker.id] || DEFAULT_MARKER_SIZE;
    const sizeInPixels = size * (isOnMap ? 4 : 3);
    const markerColor = colorMap[displayMarker.color] || colorMap.red;

    if (isOnMap) {
      return (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style={{
            left: displayMarker.x,
            top: displayMarker.y,
            zIndex: draggedMarker?.id === displayMarker.id ? 1000 : 10
          }}
          onDoubleClick={e => handleMarkerDoubleClick(e, marker)}
          onMouseDown={e => handleMarkerMouseDown(e, marker)}
        >
          <div className={`relative ${draggedMarker?.id === displayMarker.id ? "scale-110" : ""}`}>
            <div
              className={`rounded-full transition-all duration-200`}
              style={{
                width: `${sizeInPixels}px`,
                height: `${sizeInPixels}px`,
                backgroundColor: markerColor
              }}
            />
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
            <div className="font-semibold">{displayMarker.name}</div>
            <div className="text-gray-300">กลุ่ม: {displayMarker.group}</div>
            <div className="text-gray-300">สี: {colorOptions.find(c => c.value === displayMarker.color)?.label}</div>
            <div className="flex space-x-1 mt-1">
              <button
                onClick={e => {
                  e.stopPropagation();
                  resetMarkerPosition(displayMarker.id);
                }}
                className="text-blue-300 hover:text-blue-100 text-xs"
                title="กลับตำแหน่งเดิม"
              >
                ↺
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  removeMarker(displayMarker.id);
                }}
                className="text-red-300 hover:text-red-100"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div
          className={`rounded-full transition-all duration-200`}
          style={{
            width: `${sizeInPixels}px`,
            height: `${sizeInPixels}px`,
            backgroundColor: markerColor
          }}
        />
      );
    }
  };

  // เพิ่มฟังก์ชันคำนวณมุม
  const calculateAngle = (center, point) => {
    return Math.atan2(point.y - center.y, point.x - center.x) * (180 / Math.PI);
  };

  // อัพเดท JSX สำหรับแสดงกลุ่ม
  const renderZone = zone => {
    if (!visibleZones[zone.id]) return null;
    // ถ้ากำลังแก้ไขกลุ่มนี้ ให้ใช้ข้อมูลจาก editZoneData แทน
    const displayZone = editZoneData?.id === zone.id ? editZoneData : zone;
    const zoneColors = getZoneColors(displayZone.color);
    const isBeingDragged = draggedZone?.id === zone.id;

    // สร้างจุดจับสำหรับปรับขนาด
    const resizeHandles = [
      { position: "nw", cursor: "nw-resize", style: { top: -5, left: -5 } },
      { position: "n", cursor: "n-resize", style: { top: -5, left: "50%", transform: "translateX(-50%)" } },
      { position: "ne", cursor: "ne-resize", style: { top: -5, right: -5 } },
      { position: "w", cursor: "w-resize", style: { top: "50%", left: -5, transform: "translateY(-50%)" } },
      { position: "e", cursor: "e-resize", style: { top: "50%", right: -5, transform: "translateY(-50%)" } },
      { position: "sw", cursor: "sw-resize", style: { bottom: -5, left: -5 } },
      { position: "s", cursor: "s-resize", style: { bottom: -5, left: "50%", transform: "translateX(-50%)" } },
      { position: "se", cursor: "se-resize", style: { bottom: -5, right: -5 } }
    ];

    return (
      <div
        key={zone.id}
        className={`absolute ${zoneColors.bgOpacity} ${zoneColors.border} border-2 border-dashed 
          ${isBeingDragged ? "opacity-80" : "opacity-60"} transition-opacity cursor-move group`}
        style={{
          left: zone.x,
          top: zone.y,
          width: zone.width,
          height: zone.height,
          zIndex: isBeingDragged ? 1000 : 5,
          transform: `rotate(${zone.rotation || 0}deg)`,
          transformOrigin: "center"
        }}
        onMouseDown={e => handleZoneMouseDown(e, zone)}
        onDoubleClick={e => handleZoneDoubleClick(e, zone)}
      >
        <div className="absolute top-1 left-1 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium text-gray-700">
          {displayZone.name}
        </div>

        {/* จุดจับสำหรับหมุน */}
        <div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-md 
            flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onMouseDown={e => handleZoneMouseDown(e, zone, "rotate")}
          title="หมุนพื้นที่"
        >
          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>

        {/* จุดจับสำหรับปรับขนาด */}
        {resizeHandles.map(handle => (
          <div
            key={handle.position}
            className={`absolute w-3 h-3 bg-white border-2 ${zoneColors.border} rounded-full 
              opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
            style={{
              ...handle.style,
              cursor: handle.cursor,
              zIndex: 1001
            }}
            onMouseDown={e => handleZoneMouseDown(e, zone, handle.position)}
          />
        ))}
      </div>
    );
  };

  // จัดการ double click ที่กลุ่ม
  const handleZoneDoubleClick = (e, zone) => {
    e.preventDefault();
    e.stopPropagation();
    setOriginalZoneData({ ...zone }); // เก็บข้อมูลเดิมไว้
    setEditZoneData({ ...zone });
    setShowEditZoneModal(true);
  };

  // บันทึกการแก้ไขกลุ่ม
  const handleEditZoneSubmit = e => {
    e.preventDefault();
    if (editZoneData) {
      setZones(prevZones =>
        prevZones.map(zone =>
          zone.id === editZoneData.id ? { ...zone, name: editZoneData.name, color: editZoneData.color } : zone
        )
      );
      setShowEditZoneModal(false);
      setEditZoneData(null);
      setOriginalZoneData(null);
    }
  };

  // เพิ่ม useEffect สำหรับจัดการ loading state
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // รอให้ component ถูก mount และ state เริ่มต้นถูกตั้งค่า
        await Promise.all([
          new Promise(resolve => setTimeout(resolve, 100)), // รอให้ DOM เรนเดอร์
          new Promise(resolve => {
            if (imageRef.current) {
              if (imageRef.current.complete) {
                resolve();
              } else {
                imageRef.current.onload = resolve;
              }
            } else {
              resolve();
            }
          })
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2" />
            <div className="text-gray-600">กำลังโหลด...</div>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* แผนที่หลัก */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">แผนที่หมู่บ้าน - คลิกเพื่อเพิ่มจุดสำคัญ</h2>

            {/* ภาพหมู่บ้าน */}
            <div
              className="relative inline-block w-full border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src="/3-4430 1.png"
                alt="แผนที่หมู่บ้าน"
                className={`w-full h-auto select-none ${isDragging || isDraggingZone ? "cursor-grabbing" : "cursor-crosshair"}`}
                onClick={handleImageClick}
                onMouseDown={handleImageMouseDown}
                onError={e => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
                draggable={false}
              />

              {/* พื้นหลังทดแทนถ้าไม่มีรูป */}
              <div
                className={`w-full h-96 bg-gradient-to-br from-green-200 to-green-400 hidden items-center justify-center select-none ${
                  isDragging || isDraggingZone ? "cursor-grabbing" : "cursor-crosshair"
                }`}
                onClick={handleImageClick}
                onMouseDown={handleImageMouseDown}
              >
                <div className="text-center text-gray-700">
                  <div className="text-6xl mb-4">🏘️</div>
                  <p className="text-lg font-semibold">แผนที่หมู่บ้าน</p>
                  <p className="text-sm">คลิกเพื่อเพิ่มจุดสำคัญ</p>
                </div>
              </div>

              {/* แสดงกลุ่มที่มีการเปิดการแสดงผล */}
              {zones.map(zone => renderZone(zone))}

              {/* แสดงพรีวิวกลุ่มขณะลาก */}
              {(isSelectingZone || (showZoneModal && currentSelection)) &&
                ((isSelectingZone && selectionStart && selectionEnd) || (!isSelectingZone && currentSelection)) && (
                  <div
                    className="absolute bg-blue-200 border-2 border-blue-500 border-dashed opacity-50 pointer-events-none"
                    style={{
                      left: Math.min(
                        isSelectingZone && selectionStart ? selectionStart.x : currentSelection.startX,
                        isSelectingZone && selectionEnd ? selectionEnd.x : currentSelection.endX
                      ),
                      top: Math.min(
                        isSelectingZone && selectionStart ? selectionStart.y : currentSelection.startY,
                        isSelectingZone && selectionEnd ? selectionEnd.y : currentSelection.endY
                      ),
                      width: Math.abs(
                        isSelectingZone && selectionStart && selectionEnd
                          ? selectionEnd.x - selectionStart.x
                          : currentSelection.endX - currentSelection.startX
                      ),
                      height: Math.abs(
                        isSelectingZone && selectionStart && selectionEnd
                          ? selectionEnd.y - selectionStart.y
                          : currentSelection.endY - currentSelection.startY
                      )
                    }}
                  />
                )}

              {/* Markers */}
              {markers.map(marker => renderMarker(marker, true))}
            </div>

            {/* คำแนะนำการใช้งาน */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <div className="font-medium mb-1">วิธีการใช้งาน:</div>
              <ul className="space-y-1 text-xs">
                <li>
                  • <span className="font-semibold">คลิกเดียว</span> ที่ภาพเพื่อเพิ่มจุดสำคัญใหม่
                </li>
                <li>
                  • <span className="font-semibold">กดค้างแล้วลาก</span> เพื่อสร้างกลุ่มใหม่
                </li>
                <li>• ลากจุดสีเพื่อย้ายตำแหน่ง</li>
                <li>• ลาก marker เข้าไปในกลุ่มเพื่อเปลี่ยนกลุ่มอัตโนมัติ</li>
                <li>• ใช้ปุ่ม แสดง/ซ่อน เพื่อจัดการการแสดงผลกลุ่ม</li>
              </ul>
            </div>
          </div>

          {/* รายการกลุ่มด้านขวา */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">กลุ่มทั้งหมด ({zones.length})</h3>
              <div className="space-y-4">
                {/* แสดงกลุ่ม Marker สำหรับ marker ที่ไม่ได้อยู่ในกลุ่มใดๆ */}
                <div className="bg-gray-50 p-4 rounded-lg border hover:bg-gray-100 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded" />
                      <span className="font-medium text-gray-800">Marker</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        ({markers.filter(marker => !zones.some(zone => isPointInZone(marker.x, marker.y, zone))).length} จุด)
                      </span>
                    </div>
                  </div>
                  {/* รายการ Markers ที่ไม่ได้อยู่ในกลุ่มใดๆ */}
                  <div className="mt-2 space-y-1">
                    {markers
                      .filter(marker => !zones.some(zone => isPointInZone(marker.x, marker.y, zone)))
                      .map(marker => {
                        const markerColors = getMarkerColors(marker.color);
                        const currentSize = markerSizes[marker.id] || DEFAULT_MARKER_SIZE;
                        const isDragging = draggedListMarker?.id === marker.id;

                        return (
                          <div
                            key={marker.id}
                            className={`flex items-center justify-between bg-white p-2 rounded border text-sm cursor-move transition-all duration-200 ${
                              isDragging ? "opacity-50" : "hover:shadow-md"
                            }`}
                            draggable
                            onDragStart={e => handleMarkerDragStart(e, marker)}
                            onDragEnd={handleMarkerDragEnd}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className={`${markerColors.bg} rounded-full transition-all duration-200`}
                                style={{
                                  width: `${currentSize * 3}px`,
                                  height: `${currentSize * 3}px`
                                }}
                              />
                              <span>{marker.name}</span>
                            </div>
                            <div className="flex space-x-1">
                              {!isDragging && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    resetMarkerPosition(marker.id);
                                  }}
                                  className="text-blue-500 hover:text-blue-700"
                                  title="กลับตำแหน่งเดิม"
                                  onMouseDown={e => e.stopPropagation()}
                                  onDragStart={e => e.preventDefault()}
                                >
                                  ↺
                                </button>
                              )}
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  removeMarker(marker.id);
                                }}
                                className="text-red-500 hover:text-red-700"
                                onMouseDown={e => e.stopPropagation()}
                                onDragStart={e => e.preventDefault()}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* แสดงรายการกลุ่มอื่นๆ */}
                {zones.map(zone => {
                  const zoneColors = getZoneColors(zone.color);
                  const markersInZone = markers.filter(marker => isPointInZone(marker.x, marker.y, zone));
                  const isDropTarget = dragOverZoneId === zone.id;
                  return (
                    <div
                      key={zone.id}
                      className={`bg-gray-50 p-4 rounded-lg border transition-all duration-200 ${
                        isDropTarget ? "border-blue-500 bg-blue-50" : "hover:bg-gray-100 border-gray-200"
                      }`}
                      onDragOver={e => handleZoneDragOver(e, zone)}
                      onDragLeave={handleZoneDragLeave}
                      onDrop={e => handleZoneDrop(e, zone)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 ${zoneColors.bgOpacity} ${zoneColors.border} border rounded`} />
                          <span className="font-medium text-gray-800">{zone.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">({markersInZone.length} จุด)</span>
                          <button onClick={() => removeZone(zone.id)} className="text-red-500 hover:text-red-700 text-sm">
                            ลบ
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <button
                          onClick={() => toggleZoneVisibility(zone.id)}
                          className={`px-2 py-1 rounded ${
                            visibleZones[zone.id]
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                          } transition-colors`}
                        >
                          {visibleZones[zone.id] ? "ซ่อนกลุ่ม" : "แสดงกลุ่ม"}
                        </button>
                      </div>
                      {/* รายการ Markers ในกลุ่ม */}
                      {markersInZone.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-sm font-medium text-gray-700 mb-1">จุดในกลุ่ม:</div>
                          {markersInZone.map(marker => {
                            const markerColors = getMarkerColors(marker.color);
                            const isInOriginalPosition = marker.x === marker.originalX && marker.y === marker.originalY;
                            const isDragging = draggedListMarker?.id === marker.id;
                            const currentSize = markerSizes[marker.id] || DEFAULT_MARKER_SIZE;

                            return (
                              <div
                                key={marker.id}
                                className={`flex items-center justify-between bg-white p-2 rounded border text-sm cursor-move transition-all duration-200 ${
                                  isDragging ? "opacity-50" : "hover:shadow-md"
                                }`}
                                draggable
                                onDragStart={e => handleMarkerDragStart(e, marker)}
                                onDragEnd={handleMarkerDragEnd}
                              >
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`${markerColors.bg} rounded-full transition-all duration-200`}
                                    style={{
                                      width: `${currentSize * 3}px`,
                                      height: `${currentSize * 3}px`
                                    }}
                                  />
                                  <span>{marker.name}</span>
                                  {!isInOriginalPosition && <span className="text-xs text-orange-500">(ย้ายแล้ว)</span>}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex space-x-1">
                                    {!isInOriginalPosition && (
                                      <button
                                        onClick={e => {
                                          e.stopPropagation();
                                          resetMarkerPosition(marker.id);
                                        }}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="กลับตำแหน่งเดิม"
                                        onMouseDown={e => e.stopPropagation()}
                                        onDragStart={e => e.preventDefault()}
                                      >
                                        ↺
                                      </button>
                                    )}
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        removeMarker(marker.id);
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                      onMouseDown={e => e.stopPropagation()}
                                      onDragStart={e => e.preventDefault()}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip Form สำหรับสร้างกลุ่ม */}
      {showZoneModal && currentSelection && (
        <div
          className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-72 animate-scaleIn"
          style={{
            left:
              Math.min(currentSelection.startX, currentSelection.endX) +
              Math.abs(currentSelection.endX - currentSelection.startX) / 2,
            top: Math.max(currentSelection.startY, currentSelection.endY) + 20,
            transform: "translate(-50%, 0)"
          }}
        >
          <div className="relative">
            <form onSubmit={handleZoneSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกลุ่ม:</label>
                <input
                  type="text"
                  value={zoneFormData.name}
                  onChange={e => setZoneFormData({ ...zoneFormData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="เช่น บริเวณสำนักงาน"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกสีกลุ่ม:</label>
                <div className="flex items-center justify-center space-x-4">
                  {zoneColorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setZoneFormData({ ...zoneFormData, color: color.value })}
                      className={`w-6 h-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${color.bg} 
                        ${
                          zoneFormData.color === color.value
                            ? "ring-2 ring-offset-2 ring-gray-400 scale-125"
                            : "hover:scale-110"
                        }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-blue-600 transition-all duration-200"
                >
                  สร้างกลุ่ม
                </button>
                <button
                  type="button"
                  onClick={closeZoneModal}
                  className="flex-1 bg-gray-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-gray-600 transition-all duration-200"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Form สำหรับสร้าง Marker */}
      {showPopup && (
        <div
          className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-72 animate-scaleIn"
          style={{
            left: currentPosition.x,
            top: currentPosition.y + 10,
            transform: "translate(-50%, 0)"
          }}
        >
          <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสถานที่:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="เช่น บ้านนายสมชาย"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกสี:</label>
                <div className="flex items-center justify-center space-x-4">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-6 h-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${color.bg} 
                        ${formData.color === color.value ? "ring-2 ring-offset-2 ring-gray-400 scale-125" : "hover:scale-110"}`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-blue-600 transition-all duration-200"
                >
                  สร้าง Marker
                </button>
                <button
                  type="button"
                  onClick={closePopup}
                  className="flex-1 bg-gray-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-gray-600 transition-all duration-200"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Form สำหรับแก้ไข Marker */}
      {showEditMarkerModal && editMarkerData && (
        <div
          className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-72"
          style={{
            left: editMarkerData.x + 30,
            top: editMarkerData.y,
            transform: "translate(0, -50%)"
          }}
        >
          <div className="relative">
            <form onSubmit={handleEditMarkerSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสถานที่:</label>
                <input
                  type="text"
                  value={editMarkerData.name}
                  onChange={e => setEditMarkerData({ ...editMarkerData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="เช่น บ้านนายสมชาย"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">กลุ่ม/หมู่บ้าน:</label>
                <select
                  value={editMarkerData.group}
                  onChange={e => setEditMarkerData({ ...editMarkerData, group: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="Marker">Marker</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.name}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ขนาด:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={MIN_MARKER_SIZE}
                    max={MAX_MARKER_SIZE}
                    value={editMarkerData.size}
                    onChange={e =>
                      setEditMarkerData(prev => ({
                        ...prev,
                        size: parseInt(e.target.value)
                      }))
                    }
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                    onDragStart={e => e.preventDefault()}
                    className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 w-6 text-center">{editMarkerData.size}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกสี:</label>
                <div className="flex items-center justify-center space-x-4">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setEditMarkerData({ ...editMarkerData, color: color.value })}
                      className={`w-6 h-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${color.bg} 
                        ${
                          editMarkerData.color === color.value
                            ? "ring-2 ring-offset-2 ring-gray-400 scale-125"
                            : "hover:scale-110"
                        }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-blue-600 transition-all duration-200"
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditMarkerModal(false);
                    setEditMarkerData(null);
                    // กลับคืนค่าเดิมของ marker
                    if (originalMarkerData) {
                      setMarkerSizes(prev => ({
                        ...prev,
                        [originalMarkerData.id]: originalMarkerData.size
                      }));
                      setOriginalMarkerData(null);
                    }
                  }}
                  className="flex-1 bg-gray-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-gray-600 transition-all duration-200"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Form สำหรับแก้ไขกลุ่ม */}
      {showEditZoneModal && editZoneData && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-72"
        >
          <div className="relative">
            <form onSubmit={handleEditZoneSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกลุ่ม:</label>
                <input
                  type="text"
                  value={editZoneData.name}
                  onChange={e => setEditZoneData({ ...editZoneData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="เช่น บริเวณสำนักงาน"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกสีกลุ่ม:</label>
                <div className="flex items-center justify-center space-x-4">
                  {zoneColorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setEditZoneData({ ...editZoneData, color: color.value })}
                      className={`w-6 h-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${color.bg} 
                        ${
                          editZoneData.color === color.value
                            ? "ring-2 ring-offset-2 ring-gray-400 scale-125"
                            : "hover:scale-110"
                        }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-blue-600 transition-all duration-200"
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // กลับคืนค่าเดิม
                    if (originalZoneData) {
                      setEditZoneData({ ...originalZoneData });
                    }
                    setShowEditZoneModal(false);
                    setEditZoneData(null);
                    setOriginalZoneData(null);
                  }}
                  className="flex-1 bg-gray-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-gray-600 transition-all duration-200"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, 20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        /* Custom Range Slider Styles */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: #e5e7eb;
          outline: none;
          transition: all 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          transition: all 0.2s;
        }

        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        input[type="range"]:hover::-webkit-slider-thumb {
          background: #2563eb;
          transform: scale(1.2);
        }

        input[type="range"]:hover::-moz-range-thumb {
          background: #2563eb;
          transform: scale(1.2);
        }

        input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.1);
        }

        input[type="range"]:active::-moz-range-thumb {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
