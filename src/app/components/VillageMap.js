"use client";
import { useEffect, useRef, useState } from "react";

// เพิ่ม type สำหรับ action history
const ACTION_TYPES = {
  ADD_MARKER: "ADD_MARKER",
  REMOVE_MARKER: "REMOVE_MARKER",
  MOVE_MARKER: "MOVE_MARKER",
  RESET_MARKER: "RESET_MARKER",
  ADD_ZONE: "ADD_ZONE",
  REMOVE_ZONE: "REMOVE_ZONE",
  EDIT_MARKER: "EDIT_MARKER",
  EDIT_ZONE: "EDIT_ZONE",
  MOVE_GROUP: "MOVE_GROUP",
  MOVE_ZONE_GROUP: "MOVE_ZONE_GROUP",
  MOVE_MIXED_GROUP: "MOVE_MIXED_GROUP"
};

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
  const [selectedZoneShape, setSelectedZoneShape] = useState("rectangle");
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
  // เพิ่ม state สำหรับเก็บประวัติการกระทำ
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  // เพิ่ม state สำหรับเก็บประวัติการเคลื่อนไหว
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  // เพิ่ม state สำหรับการเลือกแบบกลุ่ม
  const [isGroupSelecting, setIsGroupSelecting] = useState(false);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
  const [groupSelectionStart, setGroupSelectionStart] = useState(null);
  const [groupSelectionEnd, setGroupSelectionEnd] = useState(null);
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  const [isDraggingZoneGroup, setIsDraggingZoneGroup] = useState(false);
  const [isDraggingMixed, setIsDraggingMixed] = useState(false);
  const [groupDragOffset, setGroupDragOffset] = useState({ x: 0, y: 0 });
  const [dragReference, setDragReference] = useState(null);
  const [justFinishedGroupSelection, setJustFinishedGroupSelection] = useState(false);
  // เพิ่ม state สำหรับ zoom
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const containerRef = useRef(null);

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

  // เพิ่มตัวเลือกรูปทรง zone
  const zoneShapeOptions = [
    { value: "rectangle", label: "", icon: "⬛" },
    { value: "circle", label: "", icon: "🔵" },
    { value: "triangle", label: "", icon: "🔺" }
  ];

  // ระยะทางขั้นต่ำที่ถือว่าเป็นการลาก (pixels)
  const DRAG_THRESHOLD = 5;

  // เพิ่มค่าเริ่มต้นขนาด marker
  const DEFAULT_MARKER_SIZE = 6; // ขนาดเริ่มต้น 24px (6 * 4)
  const MIN_MARKER_SIZE = 1; // ขนาดต่ำสุด 16px
  const MAX_MARKER_SIZE = 16; // ขนาดสูงสุด 48px

  // ตรวจสอบว่าจุดอยู่ในกลุ่มหรือไม่
  const isPointInZone = (x, y, zone) => {
    const { shape = "rectangle", x: zx, y: zy, width, height } = zone;

    switch (shape) {
      case "circle":
        // สำหรับวงกลม: ตรวจสอบระยะห่างจากจุดกึ่งกลาง
        const centerX = zx + width / 2;
        const centerY = zy + height / 2;
        const radiusX = width / 2;
        const radiusY = height / 2;
        const dx = (x - centerX) / radiusX;
        const dy = (y - centerY) / radiusY;
        return dx * dx + dy * dy <= 1;

      case "triangle":
        // สำหรับสามเหลี่ยม: ใช้ point-in-triangle algorithm
        const x1 = zx + width / 2; // จุดยอดบน
        const y1 = zy;
        const x2 = zx; // จุดซ้ายล่าง
        const y2 = zy + height;
        const x3 = zx + width; // จุดขวาล่าง
        const y3 = zy + height;

        const sign = (px, py, ax, ay, bx, by) => {
          return (px - bx) * (ay - by) - (ax - bx) * (py - by);
        };

        const d1 = sign(x, y, x1, y1, x2, y2);
        const d2 = sign(x, y, x2, y2, x3, y3);
        const d3 = sign(x, y, x3, y3, x1, y1);

        const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
        const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

        return !(hasNeg && hasPos);

      default:
        // rectangle
        return x >= zx && x <= zx + width && y >= zy && y <= zy + height;
    }
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
    if (
      isDragging ||
      hasDragged ||
      isGroupSelecting ||
      isDraggingGroup ||
      isDraggingZoneGroup ||
      isDraggingMixed ||
      selectedMarkers.length > 0 ||
      selectedZones.length > 0 ||
      justFinishedGroupSelection
    ) {
      setHasDragged(false);
      setJustFinishedGroupSelection(false);
      return;
    }

    // แปลงตำแหน่งเมาส์เป็นตำแหน่งบนรูปภาพที่ zoom แล้ว
    const rect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    // คำนวณตำแหน่งจริงบนรูปภาพ
    const x = (mouseX - panOffset.x) / zoomLevel;
    const y = (mouseY - panOffset.y) / zoomLevel;

    // ตรวจสอบว่าอยู่ในขอบเขตรูปภาพหรือไม่
    const imageWidth = rect.width / zoomLevel;
    const imageHeight = rect.height / zoomLevel;
    if (x < 0 || x > imageWidth || y < 0 || y > imageHeight) {
      return;
    }

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

  // เพิ่มฟังก์ชันสำหรับเพิ่มประวัติการกระทำ
  const addToHistory = (actionType, data) => {
    const newAction = {
      type: actionType,
      data: data,
      timestamp: Date.now()
    };

    // ตัดประวัติที่อยู่หลังตำแหน่งปัจจุบันออก
    const newHistory = history.slice(0, currentIndex + 1);

    setHistory([...newHistory, newAction]);
    setCurrentIndex(currentIndex + 1);
  };

  // เพิ่มฟังก์ชัน undo
  const undo = () => {
    if (currentIndex >= 0) {
      const action = history[currentIndex];

      switch (action.type) {
        case ACTION_TYPES.ADD_MARKER:
          setMarkers(markers.filter(m => m.id !== action.data.id));
          break;
        case ACTION_TYPES.REMOVE_MARKER:
          setMarkers([...markers, action.data]);
          break;
        case ACTION_TYPES.MOVE_MARKER:
          setMarkers(
            markers.map(m => (m.id === action.data.id ? { ...m, x: action.data.previousX, y: action.data.previousY } : m))
          );
          break;
        case ACTION_TYPES.RESET_MARKER:
          setMarkers(markers.map(m => (m.id === action.data.id ? { ...m, x: action.data.x, y: action.data.y } : m)));
          break;
        case ACTION_TYPES.ADD_ZONE:
          setZones(zones.filter(z => z.id !== action.data.id));
          break;
        case ACTION_TYPES.REMOVE_ZONE:
          setZones([...zones, action.data]);
          break;
        case ACTION_TYPES.EDIT_ZONE:
          setZones(zones.map(z => (z.id === action.data.id ? { ...z, ...action.data.previous } : z)));
          break;
        case ACTION_TYPES.EDIT_MARKER:
          setMarkers(markers.map(m => (m.id === action.data.id ? { ...m, ...action.data.previous } : m)));
          break;
        case ACTION_TYPES.MOVE_GROUP:
          setMarkers(
            markers.map(marker => {
              const originalMarker = action.data.markers.find(m => m.id === marker.id);
              if (originalMarker) {
                return {
                  ...marker,
                  x: originalMarker.originalX,
                  y: originalMarker.originalY
                };
              }
              return marker;
            })
          );
          break;
        case ACTION_TYPES.MOVE_ZONE_GROUP:
          setZones(
            zones.map(zone => {
              const originalZone = action.data.zones.find(z => z.id === zone.id);
              if (originalZone) {
                return {
                  ...zone,
                  x: originalZone.originalX,
                  y: originalZone.originalY
                };
              }
              return zone;
            })
          );
          break;
        case ACTION_TYPES.MOVE_MIXED_GROUP:
          // undo สำหรับ markers
          if (action.data.markers) {
            setMarkers(
              markers.map(marker => {
                const originalMarker = action.data.markers.find(m => m.id === marker.id);
                if (originalMarker) {
                  return {
                    ...marker,
                    x: originalMarker.originalX,
                    y: originalMarker.originalY
                  };
                }
                return marker;
              })
            );
          }
          // undo สำหรับ zones
          if (action.data.zones) {
            setZones(
              zones.map(zone => {
                const originalZone = action.data.zones.find(z => z.id === zone.id);
                if (originalZone) {
                  return {
                    ...zone,
                    x: originalZone.originalX,
                    y: originalZone.originalY
                  };
                }
                return zone;
              })
            );
          }
          break;
      }

      setCurrentIndex(currentIndex - 1);
    }
  };

  // เพิ่มฟังก์ชัน redo
  const redo = () => {
    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1;
      const action = history[nextIndex];

      switch (action.type) {
        case ACTION_TYPES.ADD_MARKER:
          setMarkers([...markers, action.data]);
          break;
        case ACTION_TYPES.REMOVE_MARKER:
          setMarkers(markers.filter(m => m.id !== action.data.id));
          break;
        case ACTION_TYPES.MOVE_MARKER:
          setMarkers(markers.map(m => (m.id === action.data.id ? { ...m, x: action.data.x, y: action.data.y } : m)));
          break;
        case ACTION_TYPES.RESET_MARKER:
          setMarkers(
            markers.map(m => (m.id === action.data.id ? { ...m, x: action.data.originalX, y: action.data.originalY } : m))
          );
          break;
        case ACTION_TYPES.ADD_ZONE:
          setZones([...zones, action.data]);
          break;
        case ACTION_TYPES.REMOVE_ZONE:
          setZones(zones.filter(z => z.id !== action.data.id));
          break;
        case ACTION_TYPES.EDIT_ZONE:
          setZones(zones.map(z => (z.id === action.data.id ? { ...z, ...action.data.current } : z)));
          break;
        case ACTION_TYPES.EDIT_MARKER:
          setMarkers(markers.map(m => (m.id === action.data.id ? { ...m, ...action.data.current } : m)));
          break;
        case ACTION_TYPES.MOVE_GROUP:
          setMarkers(
            markers.map(marker => {
              const movedMarker = action.data.markers.find(m => m.id === marker.id);
              if (movedMarker) {
                return {
                  ...marker,
                  x: movedMarker.currentX,
                  y: movedMarker.currentY
                };
              }
              return marker;
            })
          );
          break;
        case ACTION_TYPES.MOVE_ZONE_GROUP:
          setZones(
            zones.map(zone => {
              const movedZone = action.data.zones.find(z => z.id === zone.id);
              if (movedZone) {
                return {
                  ...zone,
                  x: movedZone.currentX,
                  y: movedZone.currentY
                };
              }
              return zone;
            })
          );
          break;
        case ACTION_TYPES.MOVE_MIXED_GROUP:
          // redo สำหรับ markers
          if (action.data.markers) {
            setMarkers(
              markers.map(marker => {
                const movedMarker = action.data.markers.find(m => m.id === marker.id);
                if (movedMarker) {
                  return {
                    ...marker,
                    x: movedMarker.currentX,
                    y: movedMarker.currentY
                  };
                }
                return marker;
              })
            );
          }
          // redo สำหรับ zones
          if (action.data.zones) {
            setZones(
              zones.map(zone => {
                const movedZone = action.data.zones.find(z => z.id === zone.id);
                if (movedZone) {
                  return {
                    ...zone,
                    x: movedZone.currentX,
                    y: movedZone.currentY
                  };
                }
                return zone;
              })
            );
          }
          break;
      }

      setCurrentIndex(nextIndex);
    }
  };

  // เพิ่ม useEffect สำหรับจัดการ wheel event บน container
  useEffect(
    () => {
      const container = containerRef.current;
      if (container) {
        // เพิ่ม passive: false เพื่อให้สามารถ preventDefault ได้
        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
          container.removeEventListener("wheel", handleWheel);
        };
      }
    },
    [zoomLevel, panOffset]
  );

  // เพิ่ม event listener สำหรับ keyboard shortcuts
  useEffect(
    () => {
      const handleKeyDown = e => {
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z") {
          e.preventDefault();
          redo();
        }
        if (e.key === "Escape") {
          clearSelection();
        }
        // เพิ่ม shortcut สำหรับรีเซ็ต zoom
        if ((e.ctrlKey || e.metaKey) && e.key === "0") {
          e.preventDefault();
          resetZoomAndPan();
        }
        // ติดตาม ctrl key
        if (e.ctrlKey || e.metaKey) {
          setIsCtrlPressed(true);
        }
      };

      const handleKeyUp = e => {
        if (!e.ctrlKey && !e.metaKey) {
          setIsCtrlPressed(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    },
    [currentIndex, history]
  );

  // อัพเดทฟังก์ชันที่เกี่ยวข้องกับการเปลี่ยนแปลง state
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
      addToHistory(ACTION_TYPES.ADD_MARKER, newMarker);

      setShowPopup(false);
      setFormData({ name: "", group: "", color: "red" });
    }
  };

  const handleZoneSubmit = e => {
    e.preventDefault();

    if (zoneFormData.name && currentSelection) {
      const x = Math.min(currentSelection.startX, currentSelection.endX);
      const y = Math.min(currentSelection.startY, currentSelection.endY);
      const width = Math.abs(currentSelection.endX - currentSelection.startX);
      const height = Math.abs(currentSelection.endY - currentSelection.startY);

      const newZone = {
        id: Date.now(),
        name: zoneFormData.name,
        color: zoneFormData.color,
        shape: selectedZoneShape,
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: 0,
        // บันทึกตำแหน่งเดิมสำหรับการรีเซ็ต
        originalX: x,
        originalY: y,
        originalWidth: width,
        originalHeight: height,
        originalRotation: 0
      };

      setZones([...zones, newZone]);
      addToHistory(ACTION_TYPES.ADD_ZONE, newZone);
      setShowZoneModal(false);
      setZoneFormData({ name: "", color: "blue" });
      // ไม่รีเซ็ต selectedZoneShape เพื่อให้คงรูปทรงปัจจุบันไว้
      setVisibleZones({ ...visibleZones, [newZone.id]: true });
    }
  };

  const removeMarker = markerId => {
    const markerToRemove = markers.find(m => m.id === markerId);
    if (markerToRemove) {
      setMarkers(markers.filter(marker => marker.id !== markerId));
      addToHistory(ACTION_TYPES.REMOVE_MARKER, markerToRemove);
    }
  };

  const removeZone = zoneId => {
    const zoneToRemove = zones.find(z => z.id === zoneId);
    if (zoneToRemove) {
      setZones(zones.filter(zone => zone.id !== zoneId));
      addToHistory(ACTION_TYPES.REMOVE_ZONE, zoneToRemove);
    }
  };

  // เพิ่มฟังก์ชันปิด popup กลับมา
  const closePopup = () => {
    setShowPopup(false);
    setFormData({ name: "", group: "", color: "red" });
  };

  // เพิ่มฟังก์ชันปิด zone modal กลับมา
  const closeZoneModal = () => {
    setShowZoneModal(false);
    setZoneFormData({ name: "", color: "blue" });
    // ไม่รีเซ็ต selectedZoneShape เพื่อให้คงรูปทรงปัจจุบันไว้
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

  // เพิ่มฟังก์ชันรีเซ็ตตำแหน่ง zone
  const resetZonePosition = zoneId => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone && zone.originalX !== undefined && zone.originalY !== undefined) {
      // บันทึกประวัติการเปลี่ยนแปลง
      addToHistory(ACTION_TYPES.EDIT_ZONE, {
        id: zoneId,
        previous: {
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          rotation: zone.rotation || 0
        },
        current: {
          x: zone.originalX,
          y: zone.originalY,
          width: zone.originalWidth || zone.width,
          height: zone.originalHeight || zone.height,
          rotation: zone.originalRotation || 0
        }
      });

      setZones(prevZones =>
        prevZones.map(z =>
          z.id === zoneId
            ? {
                ...z,
                x: z.originalX || z.x,
                y: z.originalY || z.y,
                width: z.originalWidth || z.width,
                height: z.originalHeight || z.height,
                rotation: z.originalRotation || 0
              }
            : z
        )
      );
    }
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

    // ป้องกันการลากถ้ากำลังทำ group selection
    if (isGroupSelecting) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // ตรวจสอบว่า marker นี้อยู่ในกลุ่มที่เลือกหรือไม่
    if (selectedMarkers.includes(marker.id) && selectedMarkers.length > 0) {
      // ถ้าอยู่ในกลุ่มที่เลือก ให้ใช้การลากกลุ่มแทน
      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // ถ้ามีทั้ง markers และ zones ที่เลือกไว้ ให้ใช้การลากแบบผสม
      if (selectedZones.length > 0) {
        // บันทึก original positions สำหรับทั้ง markers และ zones
        setMarkers(prevMarkers =>
          prevMarkers.map(m => {
            if (selectedMarkers.includes(m.id)) {
              return { ...m, originalX: m.x, originalY: m.y };
            }
            return m;
          })
        );

        setZones(prevZones =>
          prevZones.map(zone => {
            if (selectedZones.includes(zone.id)) {
              return { ...zone, originalX: zone.x, originalY: zone.y };
            }
            return zone;
          })
        );

        setIsDraggingMixed(true);

        // เก็บ reference point และ offset
        const referencePoint = { x: marker.x, y: marker.y, type: "marker", id: marker.id };
        setDragReference(referencePoint);
        setGroupDragOffset({
          x: x - marker.x,
          y: y - marker.y
        });
        return;
      }

      // ถ้าเลือกเฉพาะ markers
      setMarkers(prevMarkers =>
        prevMarkers.map(m => {
          if (selectedMarkers.includes(m.id)) {
            return { ...m, originalX: m.x, originalY: m.y };
          }
          return m;
        })
      );

      setIsDraggingGroup(true);
      setGroupDragOffset({
        x: x - marker.x,
        y: y - marker.y
      });
      return;
    }

    // ล้างการเลือกเก่าถ้าคลิกที่ marker ที่ไม่ได้เลือก
    if (selectedMarkers.length > 0) {
      setSelectedMarkers([]);
    }

    // ถ้าไม่ได้อยู่ในกลุ่มที่เลือก ใช้การลาก marker เดี่ยว
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
          const previousX = marker.x;
          const previousY = marker.y;

          const updatedMarker = { ...marker, x, y };
          const zone = findMarkerZone(updatedMarker);
          if (zone) {
            updatedMarker.group = zone.name;
          }

          addToHistory(ACTION_TYPES.MOVE_MARKER, {
            id: marker.id,
            previousX,
            previousY,
            x,
            y
          });

          return updatedMarker;
        }
        return marker;
      })
    );
  };

  // เริ่มการตรวจจับการลาง
  const handleImageMouseDown = e => {
    if (isDragging || isPanning) return;

    // ตรวจสอบว่ากด middle click หรือ Space+click สำหรับ panning
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    // แปลงตำแหน่งเมาส์เป็นตำแหน่งบนรูปภาพที่ zoom แล้ว
    const rect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    const x = (mouseX - panOffset.x) / zoomLevel;
    const y = (mouseY - panOffset.y) / zoomLevel;

    // ตรวจสอบว่าอยู่ในขอบเขตรูปภาพหรือไม่
    const imageWidth = rect.width / zoomLevel;
    const imageHeight = rect.height / zoomLevel;
    if (x < 0 || x > imageWidth || y < 0 || y > imageHeight) {
      return;
    }

    // ตรวจสอบว่ากด Shift หรือไม่สำหรับการเลือกแบบกลุ่ม
    if (e.shiftKey) {
      // ล้างค่าที่เกี่ยวข้องกับการสร้าง zone
      setMouseDownStart(null);
      setMouseDownTime(null);
      setHasDragged(false);
      setIsSelectingZone(false);
      setSelectionStart(null);
      setSelectionEnd(null);

      // เริ่ม group selection
      setIsGroupSelecting(true);
      setGroupSelectionStart({ x, y });
      setGroupSelectionEnd({ x, y });
      setSelectedMarkers([]);
      setSelectedZones([]);
      return;
    }

    // ตรวจสอบว่าคลิกที่ marker ที่เลือกไว้หรือไม่
    const clickedMarker = markers.find(marker => {
      const distance = Math.sqrt(Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2));
      return distance <= 15 && selectedMarkers.includes(marker.id);
    });

    // ตรวจสอบว่าคลิกที่ zone ที่เลือกไว้หรือไม่
    const clickedZone = zones.find(zone => {
      return isPointInZone(x, y, zone) && selectedZones.includes(zone.id);
    });

    // ถ้ามีทั้ง markers และ zones ที่เลือกไว้ ให้ใช้การลางแบบผสม
    if ((clickedMarker || clickedZone) && selectedMarkers.length > 0 && selectedZones.length > 0) {
      // บันทึก original positions สำหรับทั้ง markers และ zones
      setMarkers(prevMarkers =>
        prevMarkers.map(marker => {
          if (selectedMarkers.includes(marker.id)) {
            return { ...marker, originalX: marker.x, originalY: marker.y };
          }
          return marker;
        })
      );

      setZones(prevZones =>
        prevZones.map(zone => {
          if (selectedZones.includes(zone.id)) {
            return { ...zone, originalX: zone.x, originalY: zone.y };
          }
          return zone;
        })
      );

      setIsDraggingMixed(true);

      // เก็บ reference point และ offset
      const referencePoint = clickedMarker
        ? { x: clickedMarker.x, y: clickedMarker.y, type: "marker", id: clickedMarker.id }
        : { x: clickedZone.x, y: clickedZone.y, type: "zone", id: clickedZone.id };

      setDragReference(referencePoint);
      setGroupDragOffset({
        x: x - referencePoint.x,
        y: y - referencePoint.y
      });
      return;
    }

    // ถ้าเลือกเฉพาะ markers
    if (clickedMarker && selectedMarkers.length > 0 && selectedZones.length === 0) {
      // บันทึก original positions ก่อนเริ่มลาก
      setMarkers(prevMarkers =>
        prevMarkers.map(marker => {
          if (selectedMarkers.includes(marker.id)) {
            return { ...marker, originalX: marker.x, originalY: marker.y };
          }
          return marker;
        })
      );

      setIsDraggingGroup(true);
      setGroupDragOffset({
        x: x - clickedMarker.x,
        y: y - clickedMarker.y
      });
      return;
    }

    // ถ้าเลือกเฉพาะ zones
    if (clickedZone && selectedZones.length > 0 && selectedMarkers.length === 0) {
      // บันทึก original positions ก่อนเริ่มลาก zones
      setZones(prevZones =>
        prevZones.map(zone => {
          if (selectedZones.includes(zone.id)) {
            return { ...zone, originalX: zone.x, originalY: zone.y };
          }
          return zone;
        })
      );

      setIsDraggingZoneGroup(true);
      setGroupDragOffset({
        x: x - clickedZone.x,
        y: y - clickedZone.y
      });
      return;
    }

    // ล้างการเลือกถ้าคลิกที่พื้นที่ว่าง
    if (selectedMarkers.length > 0 || selectedZones.length > 0) {
      setSelectedMarkers([]);
      setSelectedZones([]);
    }

    // ตั้งค่า mouseDownStart เฉพาะถ้าไม่ได้ทำ group selection
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
    if (editMarkerData && originalMarkerData) {
      // บันทึกประวัติการแก้ไข marker
      addToHistory(ACTION_TYPES.EDIT_MARKER, {
        id: editMarkerData.id,
        previous: originalMarkerData,
        current: editMarkerData
      });

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

    // ป้องกันการลากถ้ากำลังทำ group selection
    if (isGroupSelecting) {
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // ตรวจสอบว่า zone นี้อยู่ในกลุ่มที่เลือกหรือไม่ และไม่มี handle
    if (selectedZones.includes(zone.id) && selectedZones.length > 0 && !handle) {
      // ถ้ามีทั้ง markers และ zones ที่เลือกไว้ ให้ใช้การลากแบบผสม
      if (selectedMarkers.length > 0) {
        // บันทึก original positions สำหรับทั้ง markers และ zones
        setMarkers(prevMarkers =>
          prevMarkers.map(marker => {
            if (selectedMarkers.includes(marker.id)) {
              return { ...marker, originalX: marker.x, originalY: marker.y };
            }
            return marker;
          })
        );

        setZones(prevZones =>
          prevZones.map(z => {
            if (selectedZones.includes(z.id)) {
              return { ...z, originalX: z.x, originalY: z.y };
            }
            return z;
          })
        );

        setIsDraggingMixed(true);

        // เก็บ reference point และ offset
        const referencePoint = { x: zone.x, y: zone.y, type: "zone", id: zone.id };
        setDragReference(referencePoint);
        setGroupDragOffset({
          x: mouseX - zone.x,
          y: mouseY - zone.y
        });
        return;
      }

      // ถ้าเลือกเฉพาะ zones
      setZones(prevZones =>
        prevZones.map(z => {
          if (selectedZones.includes(z.id)) {
            return { ...z, originalX: z.x, originalY: z.y };
          }
          return z;
        })
      );

      setIsDraggingZoneGroup(true);
      setGroupDragOffset({
        x: mouseX - zone.x,
        y: mouseY - zone.y
      });
      return;
    }

    // ล้างการเลือกเก่าถ้าคลิกที่ zone ที่ไม่ได้เลือก
    if (selectedZones.length > 0 && !selectedZones.includes(zone.id)) {
      setSelectedZones([]);
      setSelectedMarkers([]);
    }

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
    // จัดการ panning
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (isDragging) {
      handleMarkerMove(e);
      return;
    }

    // แปลงตำแหน่งเมาส์เป็นตำแหน่งบนรูปภาพที่ zoom แล้ว
    const rect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const rawMouseX = e.clientX - containerRect.left;
    const rawMouseY = e.clientY - containerRect.top;

    const mouseX = Math.max(0, Math.min((rawMouseX - panOffset.x) / zoomLevel, rect.width / zoomLevel));
    const mouseY = Math.max(0, Math.min((rawMouseY - panOffset.y) / zoomLevel, rect.height / zoomLevel));

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

    // จัดการการเลือกกลุ่มใหม่ (สร้าง zone) - แต่ไม่ให้ทำถ้ากำลัง group selecting
    if (mouseDownStart && !isGroupSelecting) {
      // แปลงตำแหน่งเมาส์เป็นตำแหน่งบนรูปภาพที่ zoom แล้ว
      const rect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const rawCurrentX = e.clientX - containerRect.left;
      const rawCurrentY = e.clientY - containerRect.top;

      const currentX = (rawCurrentX - panOffset.x) / zoomLevel;
      const currentY = (rawCurrentY - panOffset.y) / zoomLevel;

      const distance = getDistance(mouseDownStart, { x: currentX, y: currentY });

      if (distance >= DRAG_THRESHOLD && !isSelectingZone && !isGroupSelecting) {
        setIsSelectingZone(true);
        setSelectionStart(mouseDownStart);
        setHasDragged(true);
      }

      if (isSelectingZone) {
        const imageWidth = rect.width / zoomLevel;
        const imageHeight = rect.height / zoomLevel;
        const x = Math.max(0, Math.min(currentX, imageWidth));
        const y = Math.max(0, Math.min(currentY, imageHeight));
        setSelectionEnd({ x, y });
      }
    }

    // จัดการการเลือกแบบกลุ่ม
    if (isGroupSelecting && groupSelectionStart) {
      setGroupSelectionEnd({ x: mouseX, y: mouseY });

      // หา markers ที่อยู่ในพื้นที่เลือก
      const markersInSelection = markers
        .filter(marker => isMarkerInSelection(marker, groupSelectionStart, { x: mouseX, y: mouseY }))
        .map(marker => marker.id);

      // หา zones ที่อยู่ในพื้นที่เลือก
      const zonesInSelection = zones
        .filter(zone => isZoneInSelection(zone, groupSelectionStart, { x: mouseX, y: mouseY }))
        .map(zone => zone.id);

      setSelectedMarkers(markersInSelection);
      setSelectedZones(zonesInSelection);
      return;
    }

    // จัดการการลากกลุ่ม
    if (isDraggingGroup && selectedMarkers.length > 0) {
      // คำนวณตำแหน่งใหม่จากตำแหน่ง mouse ปัจจุบัน
      const newX = mouseX - groupDragOffset.x;
      const newY = mouseY - groupDragOffset.y;

      // หา marker หลักที่ใช้เป็นจุดอ้างอิง (marker ตัวแรกที่ถูกเลือก)
      const referenceMarker = markers.find(m => selectedMarkers.includes(m.id));
      if (referenceMarker) {
        // คำนวณการเปลี่ยนแปลงตำแหน่งจาก reference marker
        const offsetX = newX - referenceMarker.x;
        const offsetY = newY - referenceMarker.y;

        setMarkers(prevMarkers =>
          prevMarkers.map(marker => {
            if (selectedMarkers.includes(marker.id)) {
              const newMarkerX = Math.max(0, Math.min(marker.x + offsetX, rect.width));
              const newMarkerY = Math.max(0, Math.min(marker.y + offsetY, rect.height));
              return { ...marker, x: newMarkerX, y: newMarkerY };
            }
            return marker;
          })
        );
      }
      return;
    }

    // จัดการการลากแบบผสม (markers และ zones พร้อมกัน)
    if (isDraggingMixed && dragReference && (selectedMarkers.length > 0 || selectedZones.length > 0)) {
      // คำนวณตำแหน่งใหม่ของจุดอ้างอิงจาก mouse position
      const newReferenceX = mouseX - groupDragOffset.x;
      const newReferenceY = mouseY - groupDragOffset.y;

      // คำนวณ offset จากตำแหน่งเดิมของจุดอ้างอิง
      const offsetX = newReferenceX - dragReference.x;
      const offsetY = newReferenceY - dragReference.y;

      // อัพเดท markers
      if (selectedMarkers.length > 0) {
        setMarkers(prevMarkers =>
          prevMarkers.map(marker => {
            if (selectedMarkers.includes(marker.id)) {
              const originalX = marker.originalX || marker.x;
              const originalY = marker.originalY || marker.y;
              const newMarkerX = Math.max(0, Math.min(originalX + offsetX, rect.width));
              const newMarkerY = Math.max(0, Math.min(originalY + offsetY, rect.height));
              return { ...marker, x: newMarkerX, y: newMarkerY };
            }
            return marker;
          })
        );
      }

      // อัพเดท zones
      if (selectedZones.length > 0) {
        setZones(prevZones =>
          prevZones.map(zone => {
            if (selectedZones.includes(zone.id)) {
              const originalX = zone.originalX || zone.x;
              const originalY = zone.originalY || zone.y;
              const newZoneX = Math.max(0, Math.min(originalX + offsetX, rect.width - zone.width));
              const newZoneY = Math.max(0, Math.min(originalY + offsetY, rect.height - zone.height));
              return { ...zone, x: newZoneX, y: newZoneY };
            }
            return zone;
          })
        );
      }
      return;
    }

    // จัดการการลากกลุ่ม zones
    if (isDraggingZoneGroup && selectedZones.length > 0) {
      // คำนวณตำแหน่งใหม่จากตำแหน่ง mouse ปัจจุบัน
      const newX = mouseX - groupDragOffset.x;
      const newY = mouseY - groupDragOffset.y;

      // หา zone หลักที่ใช้เป็นจุดอ้างอิง (zone ตัวแรกที่ถูกเลือก)
      const referenceZone = zones.find(z => selectedZones.includes(z.id));
      if (referenceZone) {
        // คำนวณการเปลี่ยนแปลงตำแหน่งจาก reference zone
        const offsetX = newX - referenceZone.x;
        const offsetY = newY - referenceZone.y;

        setZones(prevZones =>
          prevZones.map(zone => {
            if (selectedZones.includes(zone.id)) {
              const newZoneX = Math.max(0, Math.min(zone.x + offsetX, rect.width - zone.width));
              const newZoneY = Math.max(0, Math.min(zone.y + offsetY, rect.height - zone.height));
              return { ...zone, x: newZoneX, y: newZoneY };
            }
            return zone;
          })
        );
      }
      return;
    }

    if (isRotatingZone && draggedZone) {
      const center = {
        x: draggedZone.x + draggedZone.width / 2,
        y: draggedZone.y + draggedZone.height / 2
      };
      const currentAngle = calculateAngle(center, { x: mouseX, y: mouseY }) - rotationStartAngle;

      setZones(prevZones => prevZones.map(zone => (zone.id === draggedZone.id ? { ...zone, rotation: currentAngle } : zone)));
      return;
    }
  };

  // อัพเดทการจัดการ mouse up
  const handleMouseUp = () => {
    // จัดการ panning
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // จัดการการเลือกแบบกลุ่ม
    if (isGroupSelecting) {
      setIsGroupSelecting(false);
      setGroupSelectionStart(null);
      setGroupSelectionEnd(null);
      // ล้างค่าที่เกี่ยวข้องกับการสร้าง zone เพื่อป้องกันการแสดง modal
      setIsSelectingZone(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      setHasDragged(false);
      // ตั้งค่าเพื่อป้องกันการเปิด popup ทันทีหลังจาก group selection
      setJustFinishedGroupSelection(true);
      setTimeout(() => setJustFinishedGroupSelection(false), 100);
      return;
    }

    // จัดการการลากกลุ่ม
    if (isDraggingGroup && selectedMarkers.length > 0) {
      // บันทึกประวัติการเคลื่อนย้ายกลุ่ม
      const movedMarkers = markers.filter(m => selectedMarkers.includes(m.id));
      const originalPositions = movedMarkers.map(m => ({
        id: m.id,
        originalX: m.originalX,
        originalY: m.originalY,
        currentX: m.x,
        currentY: m.y
      }));

      // บันทึกประวัติการเคลื่อนย้ายเฉพาะถ้ามีการเปลี่ยนแปลงตำแหน่ง
      const hasPositionChanged = originalPositions.some(p => p.originalX !== p.currentX || p.originalY !== p.currentY);

      if (hasPositionChanged) {
        addToHistory(ACTION_TYPES.MOVE_GROUP, {
          markers: originalPositions
        });

        // อัพเดทกลุ่มของ markers หลังจากลาก
        setMarkers(prevMarkers =>
          prevMarkers.map(marker => {
            if (selectedMarkers.includes(marker.id)) {
              const newZone = zones.find(zone => isPointInZone(marker.x, marker.y, zone));
              return {
                ...marker,
                group: newZone ? newZone.name : "Marker"
              };
            }
            return marker;
          })
        );
      }

      setIsDraggingGroup(false);
      setGroupDragOffset({ x: 0, y: 0 });
      setDragReference(null);
      return;
    }

    // จัดการการลากแบบผสม
    if (isDraggingMixed && (selectedMarkers.length > 0 || selectedZones.length > 0)) {
      let hasPositionChanged = false;
      const historyData = {};

      // จัดการ markers
      if (selectedMarkers.length > 0) {
        const movedMarkers = markers.filter(m => selectedMarkers.includes(m.id));
        const markerPositions = movedMarkers.map(m => ({
          id: m.id,
          originalX: m.originalX,
          originalY: m.originalY,
          currentX: m.x,
          currentY: m.y
        }));

        const markerChanged = markerPositions.some(p => p.originalX !== p.currentX || p.originalY !== p.currentY);

        if (markerChanged) {
          hasPositionChanged = true;
          historyData.markers = markerPositions;

          // อัพเดทกลุ่มของ markers หลังจากลาก
          setMarkers(prevMarkers =>
            prevMarkers.map(marker => {
              if (selectedMarkers.includes(marker.id)) {
                const newZone = zones.find(zone => isPointInZone(marker.x, marker.y, zone));
                return {
                  ...marker,
                  group: newZone ? newZone.name : "Marker"
                };
              }
              return marker;
            })
          );
        }
      }

      // จัดการ zones
      if (selectedZones.length > 0) {
        const movedZones = zones.filter(z => selectedZones.includes(z.id));
        const zonePositions = movedZones.map(z => ({
          id: z.id,
          originalX: z.originalX,
          originalY: z.originalY,
          currentX: z.x,
          currentY: z.y
        }));

        const zoneChanged = zonePositions.some(p => p.originalX !== p.currentX || p.originalY !== p.currentY);

        if (zoneChanged) {
          hasPositionChanged = true;
          historyData.zones = zonePositions;
        }
      }

      // บันทึกประวัติถ้ามีการเปลี่ยนแปลง
      if (hasPositionChanged) {
        addToHistory(ACTION_TYPES.MOVE_MIXED_GROUP, historyData);
      }

      setIsDraggingMixed(false);
      setGroupDragOffset({ x: 0, y: 0 });
      setDragReference(null);
      return;
    }

    // จัดการการลากกลุ่ม zones
    if (isDraggingZoneGroup && selectedZones.length > 0) {
      // บันทึกประวัติการเคลื่อนย้ายกลุ่ม zones
      const movedZones = zones.filter(z => selectedZones.includes(z.id));
      const originalPositions = movedZones.map(z => ({
        id: z.id,
        originalX: z.originalX,
        originalY: z.originalY,
        currentX: z.x,
        currentY: z.y
      }));

      // บันทึกประวัติการเคลื่อนย้ายเฉพาะถ้ามีการเปลี่ยนแปลงตำแหน่ง
      const hasPositionChanged = originalPositions.some(p => p.originalX !== p.currentX || p.originalY !== p.currentY);

      if (hasPositionChanged) {
        addToHistory(ACTION_TYPES.MOVE_ZONE_GROUP, {
          zones: originalPositions
        });
      }

      setIsDraggingZoneGroup(false);
      setGroupDragOffset({ x: 0, y: 0 });
      setDragReference(null);
      return;
    }

    if (isDraggingZone || isResizingZone || isRotatingZone) {
      // บันทึกประวัติการเปลี่ยนแปลงของ zone
      if (draggedZone && originalZoneState) {
        const currentZone = zones.find(z => z.id === draggedZone.id);
        if (currentZone) {
          addToHistory(ACTION_TYPES.EDIT_ZONE, {
            id: draggedZone.id,
            previous: {
              x: originalZoneState.initialX,
              y: originalZoneState.initialY,
              width: originalZoneState.initialWidth,
              height: originalZoneState.initialHeight,
              rotation: originalZoneState.rotation
            },
            current: {
              x: currentZone.x,
              y: currentZone.y,
              width: currentZone.width,
              height: currentZone.height,
              rotation: currentZone.rotation
            }
          });
        }
      }
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

    if (isSelectingZone && selectionStart && selectionEnd && hasDragged && !isGroupSelecting) {
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

    // ล้างค่าต่างๆ
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
    const sizeInPixels = size * (isOnMap ? 4 : 3) * (isOnMap ? zoomLevel : 1);
    const markerColor = colorMap[displayMarker.color] || colorMap.red;
    const isSelected = selectedMarkers.includes(displayMarker.id);

    if (isOnMap) {
      return (
        <div
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 group ${
            isSelected && selectedMarkers.length > 1 ? "cursor-move" : "cursor-pointer"
          }`}
          style={{
            left: displayMarker.x * zoomLevel + panOffset.x,
            top: displayMarker.y * zoomLevel + panOffset.y,
            zIndex: draggedMarker?.id === displayMarker.id || isDraggingGroup ? 1000 : 10
          }}
          onDoubleClick={e => handleMarkerDoubleClick(e, marker)}
          onMouseDown={e => handleMarkerMouseDown(e, marker)}
        >
          <div className={`relative ${draggedMarker?.id === displayMarker.id ? "scale-110" : ""}`}>
            <div
              className={`rounded-full transition-all duration-200 ${isSelected ? "ring-4 ring-blue-400 ring-opacity-75" : ""}`}
              style={{
                width: `${sizeInPixels}px`,
                height: `${sizeInPixels}px`,
                backgroundColor: markerColor
              }}
            />
            {isSelected && (
              <div
                className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-full animate-pulse"
                style={{
                  width: `${sizeInPixels + 8}px`,
                  height: `${sizeInPixels + 8}px`,
                  left: "-4px",
                  top: "-4px"
                }}
              />
            )}
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
    const isSelected = selectedZones.includes(zone.id);

    // กำหนดรูปทรง CSS ตาม shape
    const getShapeStyles = shape => {
      const colorMapping = {
        blue: "rgba(59, 130, 246, 0.3)",
        purple: "rgba(147, 51, 234, 0.3)",
        orange: "rgba(249, 115, 22, 0.3)",
        emerald: "rgba(16, 185, 129, 0.3)",
        rose: "rgba(244, 63, 94, 0.3)",
        cyan: "rgba(6, 182, 212, 0.3)",
        amber: "rgba(245, 158, 11, 0.3)"
      };

      // สีขอบที่ตรงกับสีของ zone
      const borderColorMapping = {
        blue: "#3B82F6",
        purple: "#9333EA",
        orange: "#F97316",
        emerald: "#10B981",
        rose: "#F43F5E",
        cyan: "#06B6D4",
        amber: "#F59E0B"
      };

      const currentBorderColor = isSelected ? "#3B82F6" : borderColorMapping[displayZone.color] || borderColorMapping.blue;

      switch (shape) {
        case "circle":
          return {
            borderRadius: "50%",
            border: `2px ${isSelected ? "solid" : "dashed"} ${currentBorderColor}`
          };
        case "triangle":
          return {
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            backgroundColor: colorMapping[displayZone.color] || colorMapping["blue"]
          };
        default:
          // rectangle
          return {
            border: `2px ${isSelected ? "solid" : "dashed"} ${currentBorderColor}`
          };
      }
    };

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
        className={`absolute ${displayZone.shape !== "triangle" ? zoneColors.bgOpacity : ""} ${
          displayZone.shape !== "triangle" ? zoneColors.border : ""
        } 
          ${isBeingDragged || isDraggingZoneGroup ? "opacity-80" : "opacity-60"} 
          transition-opacity cursor-move group
          ${isSelected && selectedZones.length > 1 ? "cursor-move" : ""}`}
        style={{
          left: zone.x * zoomLevel + panOffset.x,
          top: zone.y * zoomLevel + panOffset.y,
          width: zone.width * zoomLevel,
          height: zone.height * zoomLevel,
          zIndex: isBeingDragged || isDraggingZoneGroup ? 1000 : 5,
          transform: `rotate(${zone.rotation || 0}deg)`,
          transformOrigin: "center",
          ...getShapeStyles(displayZone.shape),
          ...(isSelected && {
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
            ...(displayZone.shape !== "triangle" && { borderWidth: "3px" })
          })
        }}
        onMouseDown={e => handleZoneMouseDown(e, zone)}
        onDoubleClick={e => handleZoneDoubleClick(e, zone)}
      >
        <div
          className={`absolute px-2 py-1 rounded font-medium ${
            displayZone.shape === "triangle" ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : "top-1 left-1"
          }`}
          style={{
            fontSize: `${Math.max(10, 12 * zoomLevel)}px`,
            backgroundColor: (() => {
              const colorMapping = {
                blue: "rgba(59, 130, 246, 0.9)",
                purple: "rgba(147, 51, 234, 0.9)",
                orange: "rgba(249, 115, 22, 0.9)",
                emerald: "rgba(16, 185, 129, 0.9)",
                rose: "rgba(244, 63, 94, 0.9)",
                cyan: "rgba(6, 182, 212, 0.9)",
                amber: "rgba(245, 158, 11, 0.9)"
              };
              return colorMapping[displayZone.color] || colorMapping["blue"];
            })(),
            color: "white",
            textShadow: "1px 1px 2px rgba(0,0,0,0.7)"
          }}
        >
          {displayZone.name}
        </div>

        {/* เส้นขอบสำหรับสามเหลี่ยม */}
        {displayZone.shape === "triangle" && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: "100%", height: "100%" }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon
              points="50,0 0,100 100,100"
              fill={(() => {
                const colorMapping = {
                  blue: "rgba(59, 130, 246, 0.3)",
                  purple: "rgba(147, 51, 234, 0.3)",
                  orange: "rgba(249, 115, 22, 0.3)",
                  emerald: "rgba(16, 185, 129, 0.3)",
                  rose: "rgba(244, 63, 94, 0.3)",
                  cyan: "rgba(6, 182, 212, 0.3)",
                  amber: "rgba(245, 158, 11, 0.3)"
                };
                return colorMapping[displayZone.color] || colorMapping["blue"];
              })()}
              stroke={
                isSelected
                  ? "#3B82F6"
                  : {
                      blue: "#3B82F6",
                      purple: "#9333EA",
                      orange: "#F97316",
                      emerald: "#10B981",
                      rose: "#F43F5E",
                      cyan: "#06B6D4",
                      amber: "#F59E0B"
                    }[displayZone.color] || "#3B82F6"
              }
              strokeWidth="2"
              strokeDasharray={isSelected ? "none" : "4,2"}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {/* จุดจับสำหรับหมุน */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-xl border-2 border-gray-300
            flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            top: `-${Math.max(32, Math.min(48, 36 * zoomLevel))}px`,
            width: `${Math.max(28, Math.min(40, 32 * zoomLevel))}px`,
            height: `${Math.max(28, Math.min(40, 32 * zoomLevel))}px`,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px white"
          }}
          onMouseDown={e => handleZoneMouseDown(e, zone, "rotate")}
          title="หมุนพื้นที่"
        >
          <svg
            className="text-gray-600"
            style={{
              width: `${Math.max(16, Math.min(24, 20 * zoomLevel))}px`,
              height: `${Math.max(16, Math.min(24, 20 * zoomLevel))}px`
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>

        {/* จุดจับสำหรับปรับขนาด */}
        {resizeHandles.map(handle => {
          // คำนวณขนาดจุดจับที่เหมาะสม - ขนาดใหญ่ขึ้นและมองเห็นได้ชัดเจน
          const baseSize = Math.max(zone.width * zoomLevel, zone.height * zoomLevel) > 200 ? 20 : 16;
          const handleSize = Math.max(baseSize, Math.min(24, 12 * zoomLevel + 8));
          const handleOffset = handleSize / 2;

          return (
            <div
              key={handle.position}
              className={`absolute bg-white border-3 ${zoneColors.border} rounded-full 
              opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl ring-1 ring-gray-300`}
              style={{
                ...handle.style,
                // ปรับตำแหน่งให้ถูกต้องตามขนาดจุดจับ
                ...(handle.style.top === -5 && { top: -handleOffset }),
                ...(handle.style.bottom === -5 && { bottom: -handleOffset }),
                ...(handle.style.left === -5 && { left: -handleOffset }),
                ...(handle.style.right === -5 && { right: -handleOffset }),
                width: `${handleSize}px`,
                height: `${handleSize}px`,
                cursor: handle.cursor,
                zIndex: 1001,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px white"
              }}
              onMouseDown={e => handleZoneMouseDown(e, zone, handle.position)}
            />
          );
        })}
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
    if (editZoneData && originalZoneData) {
      // บันทึกประวัติการแก้ไขกลุ่ม
      addToHistory(ACTION_TYPES.EDIT_ZONE, {
        id: editZoneData.id,
        previous: originalZoneData,
        current: editZoneData
      });

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

  // เพิ่มฟังก์ชันยกเลิกการเลือก
  const clearSelection = () => {
    setSelectedMarkers([]);
    setSelectedZones([]);
    setIsGroupSelecting(false);
    setGroupSelectionStart(null);
    setGroupSelectionEnd(null);
    setJustFinishedGroupSelection(false);
    setDragReference(null);
  };

  // เพิ่มฟังก์ชันตรวจสอบว่า marker อยู่ในพื้นที่เลือกหรือไม่
  const isMarkerInSelection = (marker, selectionStart, selectionEnd) => {
    const minX = Math.min(selectionStart.x, selectionEnd.x);
    const maxX = Math.max(selectionStart.x, selectionEnd.x);
    const minY = Math.min(selectionStart.y, selectionEnd.y);
    const maxY = Math.max(selectionStart.y, selectionEnd.y);

    return marker.x >= minX && marker.x <= maxX && marker.y >= minY && marker.y <= maxY;
  };

  // เพิ่มฟังก์ชันตรวจสอบว่า zone อยู่ในพื้นที่เลือกหรือไม่
  const isZoneInSelection = (zone, selectionStart, selectionEnd) => {
    const minX = Math.min(selectionStart.x, selectionEnd.x);
    const maxX = Math.max(selectionStart.x, selectionEnd.x);
    const minY = Math.min(selectionStart.y, selectionEnd.y);
    const maxY = Math.max(selectionStart.y, selectionEnd.y);

    // ตรวจสอบว่าจุดกึ่งกลางของ zone อยู่ในพื้นที่เลือกหรือไม่
    const zoneCenterX = zone.x + zone.width / 2;
    const zoneCenterY = zone.y + zone.height / 2;

    return zoneCenterX >= minX && zoneCenterX <= maxX && zoneCenterY >= minY && zoneCenterY <= maxY;
  };

  // เพิ่มฟังก์ชันจัดการ zoom
  const handleWheel = e => {
    // ตรวจสอบว่ากด Ctrl หรือ Cmd หรือไม่
    if (!e.ctrlKey && !e.metaKey) {
      // ถ้าไม่กด Ctrl ให้ปล่อยให้ scroll ปกติ
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));

    if (newZoom !== zoomLevel) {
      // คำนวณตำแหน่งของเมาส์เมื่อ zoom
      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      // คำนวณตำแหน่งใหม่ของ pan offset เพื่อให้ zoom ที่ตำแหน่งเมาส์
      const scaleFactor = newZoom / zoomLevel;
      const newPanX = mouseX - (mouseX - panOffset.x) * scaleFactor;
      const newPanY = mouseY - (mouseY - panOffset.y) * scaleFactor;

      setZoomLevel(newZoom);
      setPanOffset({ x: newPanX, y: newPanY });
    }
  };

  // เพิ่มฟังก์ชันป้องกันการ scroll ของหน้า page
  const preventPageScroll = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  // เพิ่มฟังก์ชันรีเซ็ต zoom และ pan
  const resetZoomAndPan = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

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
              ref={containerRef}
              className="relative inline-block w-full border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{
                cursor: isPanning ? "grabbing" : isCtrlPressed ? "grab" : "crosshair"
              }}
            >
              <img
                ref={imageRef}
                src="/3-4430 1.png"
                alt="แผนที่หมู่บ้าน"
                className="w-full h-auto select-none"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                  transformOrigin: "0 0"
                }}
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
                className="w-full h-96 bg-gradient-to-br from-green-200 to-green-400 hidden items-center justify-center select-none"
                onClick={handleImageClick}
                onMouseDown={handleImageMouseDown}
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                  transformOrigin: "0 0"
                }}
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
                ((isSelectingZone && selectionStart && selectionEnd) || (!isSelectingZone && currentSelection)) &&
                (() => {
                  // กำหนดสีตาม zoneFormData.color
                  const previewColors = {
                    blue: { bg: "bg-blue-200", border: "border-blue-500" },
                    purple: { bg: "bg-purple-200", border: "border-purple-500" },
                    orange: { bg: "bg-orange-200", border: "border-orange-500" },
                    emerald: { bg: "bg-emerald-200", border: "border-emerald-500" },
                    rose: { bg: "bg-rose-200", border: "border-rose-500" },
                    cyan: { bg: "bg-cyan-200", border: "border-cyan-500" },
                    amber: { bg: "bg-amber-200", border: "border-amber-500" }
                  };

                  const currentColors = previewColors[zoneFormData.color] || previewColors.blue;

                  const width =
                    Math.abs(
                      isSelectingZone && selectionStart && selectionEnd
                        ? selectionEnd.x - selectionStart.x
                        : currentSelection.endX - currentSelection.startX
                    ) * zoomLevel;

                  const height =
                    Math.abs(
                      isSelectingZone && selectionStart && selectionEnd
                        ? selectionEnd.y - selectionStart.y
                        : currentSelection.endY - currentSelection.startY
                    ) * zoomLevel;

                  const left =
                    Math.min(
                      isSelectingZone && selectionStart ? selectionStart.x : currentSelection.startX,
                      isSelectingZone && selectionEnd ? selectionEnd.x : currentSelection.endX
                    ) *
                      zoomLevel +
                    panOffset.x;

                  const top =
                    Math.min(
                      isSelectingZone && selectionStart ? selectionStart.y : currentSelection.startY,
                      isSelectingZone && selectionEnd ? selectionEnd.y : currentSelection.endY
                    ) *
                      zoomLevel +
                    panOffset.y;

                  // สีของเส้นขอบ
                  const borderColor =
                    {
                      blue: "#3B82F6",
                      purple: "#9333EA",
                      orange: "#F97316",
                      emerald: "#10B981",
                      rose: "#F43F5E",
                      cyan: "#06B6D4",
                      amber: "#F59E0B"
                    }[zoneFormData.color] || "#3B82F6";

                  // สีพื้นหลัง
                  const bgColor =
                    {
                      blue: "rgba(59, 130, 246, 0.3)",
                      purple: "rgba(147, 51, 234, 0.3)",
                      orange: "rgba(249, 115, 22, 0.3)",
                      emerald: "rgba(16, 185, 129, 0.3)",
                      rose: "rgba(244, 63, 94, 0.3)",
                      cyan: "rgba(6, 182, 212, 0.3)",
                      amber: "rgba(245, 158, 11, 0.3)"
                    }[zoneFormData.color] || "rgba(59, 130, 246, 0.3)";

                  return (
                    <div
                      className="absolute opacity-50 pointer-events-none"
                      style={{
                        left,
                        top,
                        width,
                        height
                      }}
                    >
                      {selectedZoneShape === "triangle" ? (
                        <>
                          {/* พื้นหลังสามเหลี่ยม */}
                          <div
                            className="absolute inset-0"
                            style={{
                              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                              backgroundColor: bgColor
                            }}
                          />
                          {/* เส้นขอบสามเหลี่ยม */}
                          <svg
                            className="absolute inset-0"
                            style={{ width: "100%", height: "100%" }}
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            <polygon
                              points="50,0 0,100 100,100"
                              fill="none"
                              stroke={borderColor}
                              strokeWidth="2"
                              strokeDasharray="4,2"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        </>
                      ) : selectedZoneShape === "circle" ? (
                        <div
                          className={`${currentColors.bg} border-2 ${
                            currentColors.border
                          } border-dashed rounded-full w-full h-full`}
                        />
                      ) : (
                        <div className={`${currentColors.bg} border-2 ${currentColors.border} border-dashed w-full h-full`} />
                      )}
                    </div>
                  );
                })()}

              {/* แสดงพื้นที่เลือกแบบกลุ่ม */}
              {isGroupSelecting && groupSelectionStart && groupSelectionEnd && (
                <div
                  className="absolute bg-green-200 border-2 border-green-500 border-dashed opacity-50 pointer-events-none"
                  style={{
                    left: Math.min(groupSelectionStart.x, groupSelectionEnd.x) * zoomLevel + panOffset.x,
                    top: Math.min(groupSelectionStart.y, groupSelectionEnd.y) * zoomLevel + panOffset.y,
                    width: Math.abs(groupSelectionEnd.x - groupSelectionStart.x) * zoomLevel,
                    height: Math.abs(groupSelectionEnd.y - groupSelectionStart.y) * zoomLevel
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
                <li>
                  • <span className="font-semibold">Ctrl+Mouse wheel</span> เพื่อ Zoom in/out
                </li>
                <li>
                  • <span className="font-semibold">Ctrl+คลิกแล้วลาก</span> หรือ{" "}
                  <span className="font-semibold">Middle click ลาก</span> เพื่อ Pan รูปภาพ
                </li>
                <li>
                  • <span className="font-semibold">Ctrl+0</span> เพื่อรีเซ็ต Zoom และ Pan
                </li>
                <li>
                  • <span className="font-semibold">Shift+ลาก</span> เพื่อเลือกหลาย markers และ zones
                </li>
                <li>
                  • <span className="font-semibold">คลิกที่ marker/zone ที่เลือกแล้วลาก</span> เพื่อย้ายทั้งกลุ่มพร้อมกัน
                </li>
                <li>• ลาก marker เข้าไปในกลุ่มเพื่อเปลี่ยนกลุ่มอัตโนมัติ</li>
                <li>• กด ESC เพื่อยกเลิกการเลือก</li>
                <li>• กด Ctrl+Z เพื่อ Undo การกระทำ, Ctrl+Shift+Z เพื่อ Redo</li>
                <li>• ใช้ปุ่ม แสดง/ซ่อน เพื่อจัดการการแสดงผลกลุ่ม</li>
                <li>
                  • <span className="font-semibold">เลือกรูปทรง</span> ก่อนลากเพื่อสร้างกลุ่มรูปทรงต่างๆ
                </li>
              </ul>
            </div>

            {/* แสดงข้อมูลการเลือก */}
            {(selectedMarkers.length > 0 || selectedZones.length > 0) && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                <div className="font-medium">
                  เลือกแล้ว: {selectedMarkers.length} markers
                  {selectedZones.length > 0 && `, ${selectedZones.length} zones`}
                </div>
                <div className="text-xs mt-1">
                  {isDraggingGroup
                    ? "กำลังลากกลุ่ม markers..."
                    : isDraggingZoneGroup
                    ? "กำลังลากกลุ่ม zones..."
                    : isDraggingMixed
                    ? "กำลังลากกลุ่มผสม (markers และ zones)..."
                    : selectedMarkers.length > 0 && selectedZones.length > 0
                    ? "คลิกที่ marker หรือ zone ที่เลือกไว้แล้วลากเพื่อเคลื่อนย้ายทั้งกลุ่มพร้อมกัน"
                    : selectedMarkers.length > 0
                    ? "คลิกที่ marker ใดๆ ที่เลือกไว้แล้วลากเพื่อเคลื่อนย้ายทั้งกลุ่ม"
                    : "คลิกที่ zone ใดๆ ที่เลือกไว้แล้วลากเพื่อเคลื่อนย้ายทั้งกลุ่ม"}
                </div>
              </div>
            )}

            {/* แสดงข้อมูล Zoom */}
            <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Zoom: {Math.round(zoomLevel * 100)}%</span>
                  {(panOffset.x !== 0 || panOffset.y !== 0) && (
                    <span className="ml-2 text-xs">
                      Pan: ({Math.round(panOffset.x)}, {Math.round(panOffset.y)})
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={undo}
                    disabled={currentIndex < 0}
                    className="w-8 h-8 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg"
                    title="ย้อนกลับการกระทำ (Ctrl+Z)"
                  >
                    ↶
                  </button>
                  <button
                    onClick={redo}
                    disabled={currentIndex >= history.length - 1}
                    className="w-8 h-8 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg"
                    title="ทำซ้ำการกระทำ (Ctrl+Shift+Z)"
                  >
                    ↷
                  </button>
                  <button
                    onClick={resetZoomAndPan}
                    className="w-8 h-8 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg"
                    title="รีเซ็ต Zoom และ Pan (Ctrl+0)"
                  >
                    🏠
                  </button>
                  <button
                    onClick={clearSelection}
                    className="w-8 h-8 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg"
                    title="ยกเลิกการเลือก (ESC)"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-blue-800 mb-1">รูปทรงกลุ่ม:</label>
                <div className="flex space-x-2">
                  {zoneShapeOptions.map(shape => (
                    <button
                      key={shape.value}
                      onClick={() => setSelectedZoneShape(shape.value)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        selectedZoneShape === shape.value
                          ? "bg-blue-500 text-white"
                          : "bg-white text-blue-700 hover:bg-blue-100"
                      }`}
                      title={shape.label}
                    >
                      {shape.icon} {shape.label}
                    </button>
                  ))}
                </div>
              </div>
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
              (Math.min(currentSelection.startX, currentSelection.endX) +
                Math.abs(currentSelection.endX - currentSelection.startX) / 2) *
                zoomLevel +
              panOffset.x,
            top: (Math.max(currentSelection.startY, currentSelection.endY) + 20) * zoomLevel + panOffset.y,
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
                <label className="block text-sm font-medium text-gray-700 mb-1">รูปทรง:</label>
                <div className="flex space-x-2">
                  {zoneShapeOptions.map(shape => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() => setSelectedZoneShape(shape.value)}
                      className={`flex-1 py-1.5 px-2 text-xs rounded border transition-all duration-200 ${
                        selectedZoneShape === shape.value
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                      }`}
                    >
                      {shape.icon} {shape.label}
                    </button>
                  ))}
                </div>
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
                  onClick={() => {
                    setShowZoneModal(false);
                    setZoneFormData({ name: "", color: "blue" });
                    // ไม่รีเซ็ต selectedZoneShape เพื่อให้คงรูปทรงปัจจุบันไว้
                    setCurrentSelection(null);
                    setIsSelectingZone(false);
                    setSelectionStart(null);
                    setSelectionEnd(null);
                  }}
                  className="flex-1 bg-gray-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-gray-600 transition-all duration-200 cursor-pointer"
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
            left: currentPosition.x * zoomLevel + panOffset.x,
            top: (currentPosition.y + 10) * zoomLevel + panOffset.y,
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
                  onClick={() => {
                    setShowPopup(false);
                    setFormData({ name: "", group: "", color: "red" });
                  }}
                  className="flex-1 bg-gray-500 text-white py-1.5 px-3 rounded-md text-sm hover:bg-gray-600 transition-all duration-200 cursor-pointer"
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
            left: editMarkerData.x * zoomLevel + panOffset.x + 30,
            top: editMarkerData.y * zoomLevel + panOffset.y,
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

              <div className="flex justify-center space-x-3 pt-1">
                <button
                  type="submit"
                  className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="บันทึกการแก้ไข"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">💾</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium">บันทึก</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // กลับคืนค่าเดิม
                    if (originalMarkerData) {
                      setMarkerSizes(prev => ({
                        ...prev,
                        [originalMarkerData.id]: originalMarkerData.size
                      }));
                    }
                    setShowEditMarkerModal(false);
                    setEditMarkerData(null);
                    setOriginalMarkerData(null);
                  }}
                  className="w-12 h-12 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="ยกเลิกการแก้ไข"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">✕</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium">ยกเลิก</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetMarkerPosition(editMarkerData.id);
                    setShowEditMarkerModal(false);
                    setEditMarkerData(null);
                    setOriginalMarkerData(null);
                  }}
                  className="w-12 h-12 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="รีเซ็ตตำแหน่งกลับไปที่ตำแหน่งเดิม"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">↺</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium">รีเซ็ต</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeMarker(editMarkerData.id);
                    setShowEditMarkerModal(false);
                    setEditMarkerData(null);
                    setOriginalMarkerData(null);
                  }}
                  className="w-12 h-12 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="ลบ marker นี้"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">🗑️</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium">ลบ</span>
                  </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">รูปทรง:</label>
                <div className="flex space-x-2">
                  {zoneShapeOptions.map(shape => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() => setEditZoneData({ ...editZoneData, shape: shape.value })}
                      className={`flex-1 py-1.5 px-2 text-xs rounded border transition-all duration-200 ${
                        (editZoneData.shape || "rectangle") === shape.value
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                      }`}
                    >
                      {shape.icon} {shape.label}
                    </button>
                  ))}
                </div>
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

              <div className="flex justify-center space-x-3 pt-1">
                <button
                  type="submit"
                  className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="บันทึกการแก้ไข"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">💾</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium">บันทึก</span>
                  </div>
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
                  className="w-12 h-12 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="ยกเลิกการแก้ไข"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">✕</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium">ยกเลิก</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetZonePosition(editZoneData.id);
                    setShowEditZoneModal(false);
                    setEditZoneData(null);
                    setOriginalZoneData(null);
                  }}
                  className="w-12 h-12 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="รีเซ็ตตำแหน่งกลับไปที่ตำแหน่งเดิม"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">↺</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium">รีเซ็ต</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeZone(editZoneData.id);
                    setShowEditZoneModal(false);
                    setEditZoneData(null);
                    setOriginalZoneData(null);
                  }}
                  className="w-12 h-12 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="ลบกลุ่มนี้"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">🗑️</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium">ลบ</span>
                  </div>
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
