import React from 'react'

const useAllSelectArray = () => {
    const units = [
        { label: 'px', value: 'px' },
        { label: '%', value: '%' },
        { label: 'em', value: 'em' },
        { label: 'rem', value: 'rem' },
    ];
    
    const borderType = [
        { value: "dotted", label: "Dotted" },
        { value: "dashed", label: "Dashed" },
        { value: "solid", label: "Solid" },
        { value: "double", label: "Double" },
        { value: "groove", label: "Groove" },
        { value: "ridge", label: "Ridge" },
        { value: "inset", label: "Inset" },
        { value: "outset", label: "Outset" },
        { value: "hidden", label: "Hidden" },
        { value: "none", label: "None" }
    ];
  return {units:units,borderType:borderType}
}

export default useAllSelectArray