import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { openAlexApiClient } from "../../../../services/openAlexApiClient";
import { Loader } from "../../../../components/Loader/Loader";
import { ForceDirectedGraph } from "../../../../components/ForceDirectedGraph/ForceDirectedGraph";

export const WorksTab = () => {
  const { subfieldId } = useParams();
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorks = async () => {
      if (!subfieldId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await openAlexApiClient.get(`/works`, {
          params: {
            filter: `primary_topic.subfield.id:${subfieldId}`,
            sort: "cited_by_count:desc",
            per_page: 200,
          },
        });

        if (response.data && response.data.results) {
          setWorks(response.data.results);
        }
      } catch (error) {
        console.error("Error fetching works:", error);
        setError("Failed to fetch works data");
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [subfieldId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {works.length === 0 ? (
        <div>No works found for this subfield</div>
      ) : (
        <ForceDirectedGraph works={works} />
      )}
    </div>
  );
};
