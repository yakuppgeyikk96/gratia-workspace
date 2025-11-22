interface CheckoutPageProps {
  searchParams: {
    id: string;
  };
}

const CheckoutPage = ({ searchParams }: CheckoutPageProps) => {
  const { id } = searchParams;

  console.log(id);

  return <div>CheckoutPage</div>;
};

export default CheckoutPage;
