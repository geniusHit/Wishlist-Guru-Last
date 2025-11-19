import { Controller, useForm } from 'react-hook-form';
import RequiredField from '../pages/RequiredField';

const SingleController = ({ name, control, children, isRequired, defaultValue, isCustomClass }) => {


  const rules = {};
  if (isRequired) {
    rules.required = true;
    // console.log("isRequired",rules.required)
  }

  return (

    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue ? defaultValue : ""}
      rules={rules}
      render={({ field, fieldState }) => {
        const { error } = fieldState;

        return (
          <div className={`${isCustomClass ? 'wf-wishlist-select-box' : ''} wf-wishlist-range-box`}>
            {children({ field })}
            {error && <RequiredField />}
          </div>
        );
      }}
    />

    // <div>
    //   <Controller
    //     name={name}
    //     control={control}
    //     defaultValue={defaultValue ? defaultValue : ""}
    //     rules={rules}
    //     render={({ field, fieldState }) => {
    //       const { error } = fieldState;

    //       return (
    //         <div>
    //           {children({ field })}
    //           {error && <RequiredField />}
    //         </div>
    //       );
    //     }}
    //   />
    // </div>
  );
};

export default SingleController;
