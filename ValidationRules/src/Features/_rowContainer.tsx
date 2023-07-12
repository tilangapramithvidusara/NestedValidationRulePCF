// import React, { useEffect, useState } from "react";
// import DropDown from "../Components/commonComponents/DropDown";
// import { Button } from "antd";

// interface NestedRowProps {
//   children: React.ReactNode;
// }

// const RowContainer: React.FC = ({rowIndex}) => {
//   const [nestedRows, setNestedRows] = useState<React.ReactNode[]>([]);

  // const NestedRow: React.FC<NestedRowProps> = ({ children }) => {
  //   return (
  //     <div style={{ display: 'flex', flexDirection: 'row' }}>
  //       {children}
  //     </div>
  //   );
  // };

//   useEffect(() => {
//     console.log("nestedRows", nestedRows);
//   }, [nestedRows]);

  // const handleAddRow = (index: number, level: number) => {
  //   setNestedRows((prevRows) => {
  //     const updatedRows = [...prevRows];
  //     updatedRows.splice(index + 1, 0, (
  //       <NestedRow key={Math.floor(Math.random() * 10000) + 1}>
  //         <tr>
  //           <td>
  //             <DropDown />
  //           </td>
  //           <td>
  //             <DropDown />
  //           </td>
  //           <td>
  //             <DropDown />
  //           </td>
  //           <td>
  //             <Button onClick={() => handleAddRow(index, level - 1)}>+ Add Nested</Button>
  //           </td>
  //           <td>
  //             <Button onClick={() => handleAddRow(index + 1, level)}>+ Add</Button>
  //           </td>
  //         </tr>
  //       </NestedRow>
  //     ));
  //     return updatedRows;
  //   });
  // };

//   return (
//     <table>
//       <thead>
//         <tr>
//           <th>Field</th>
//           <th>Operator</th>
//           <th>Value</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td>
//             <DropDown />
//           </td>
//           <td>
//             <DropDown />
//           </td>
//           <td>
//             <DropDown />
//           </td>
//           <td>
//             <Button onClick={() => handleAddRow(0, 1)}>+ Add</Button>
//           </td>
//           <td>
//             <Button onClick={() => handleAddRow(0, 2)}>+ Add Nested</Button>
//           </td>
//         </tr>
//         {nestedRows}
//       </tbody>
//     </table>
//   );
// };

// export default RowContainer;
