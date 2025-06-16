"use client";
import VillageMap from "./components/VillageMap";
import "./globals.css";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <VillageMap />
      {/* <VoiceControl></VoiceControl> */}
    </main>
  );
}

// import 'bootstrap/dist/css/bootstrap.css'

// export default function RootLayout({children} : {children: React.ReactNode}) {
//   return (
//     <html lang="en">
//       <body className="container">{children}</body>
//     </html>
//   )
// }

// // 1. สร้าง cache function
// const getProduct = cache(async (id: string) => {
//   const res = await fetch(`/api/products/${id}`)
//   return res.json()
// })

// // 2. สร้าง preload function ที่ใช้ cache
// const preloadProduct = (id: string) => {
//   // เริ่ม fetch และเก็บใน cache
//   void getProduct(id)
// }

// // 3. Component ที่แสดงรายละเอียดสินค้า
// async function ProductDetails({ id }: { id: string }) {
//   // ดึงข้อมูลจาก cache (ถ้ามี preload ไว้แล้วจะได้ข้อมูลทันที)
//   const product = await getProduct(id)

//   return (
//     <div>
//       <h1>{product.name}</h1>
//       <p>{product.description}</p>
//     </div>
//   )
// }

// // 4. List ที่มี preload
// function ProductList() {
//   return (
//     <div>
//       {products.map(product => (
//         <Link
//           key={product.id}
//           href={`/products/${product.id}`}
//           onMouseEnter={() => preloadProduct(product.id)}
//         >
//           <ProductCard product={product} />
//         </Link>
//       ))}
//     </div>
//   )
// }

// 'use client'

// import { useTransition } from 'react'

// function ProductCard({ product }) {
//   const [isPending, startTransition] = useTransition()
//   const [isFavorite, setIsFavorite] = useState(false)

//   // ใช้กับการกดปุ่มทั่วไป
//   async function toggleFavorite() {
//     startTransition(async () => {
//       try {
//         // เรียก Server Action
//         await updateFavorite(product.id)
//         // อัพเดท UI
//         setIsFavorite(!isFavorite)
//       } catch (error) {
//         console.error('Failed to update favorite')
//       }
//     })
//   }

//   return (
//     <div>
//       <h2>{product.name}</h2>
//       <button
//         onClick={toggleFavorite}
//         disabled={isPending}
//       >
//         {isPending ? 'กำลังอัพเดท...' : 'เพิ่มในรายการโปรด'}
//       </button>
//     </div>
//   )
// }
