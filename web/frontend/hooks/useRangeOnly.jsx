import React from 'react';
import { RangeSlider, TextField } from '@shopify/polaris';
import { Controller } from 'react-hook-form';

const RangeOnly = ({ controllerName, id, control, label, max, setSaveBar }) => {
    return (
        <Controller
            name={controllerName}
            control={control}
            defaultValue={1} // Initial value
            render={({ field: { onChange, value } }) => (
                <div className="wf-wishlist-range-box">
                    {/* Range Slider */}
                    <div className="wf-range-slider">
                        <RangeSlider
                            id={id}
                            label={label}
                            min={1}
                            max={max}
                            value={value || 1} // Default to 1 if value is empty
                            onChange={(newValue) => {
                                const numericValue = newValue === "" ? 1 : parseInt(newValue, 10);
                                setSaveBar(true);
                                onChange(numericValue); // Update the form value
                            }}
                        />
                    </div>

                    {/* Text Field */}
                    <div className="wf-range-input">
                        <TextField
                            value={value || ""} // Show empty input when the field is empty
                            onChange={(newValue) => {
                                // Prevent default value from being appended
                                if (newValue === "") {
                                    onChange(""); // Allow clearing the field
                                    return;
                                }

                                const numericValue = parseInt(newValue, 10);

                                // Ensure bounds and update the form value
                                if (!isNaN(numericValue)) {
                                    setSaveBar(true);
                                    onChange(Math.min(Math.max(numericValue, 1), max));
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        />


    );
};

export default RangeOnly;
