import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const DetailsCard = () => {
  const location = useLocation();

  //not sure if this is the right way to do this
  useEffect(() => {
    //whenever the location changes, re-render the component with the animation
  }, [location.pathname]);

  return <div>card</div>;
};
