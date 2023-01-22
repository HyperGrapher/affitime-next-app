type Props = {
    title: string
  }
  const EmptyListView: React.FC<Props> = ({ title }) => {
    return (
      <div className="min-h-[200px]">
        <h3 className="text-center mt-4">{title}</h3>
      </div>
    )
  }
  
  
export default EmptyListView