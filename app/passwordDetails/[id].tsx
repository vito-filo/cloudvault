import { useUserData } from "@/context/authContext";
import { PasswordItemDetail } from "@/types/password";
import { apiFetch } from "@/utils/api";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function PasswordDetail() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const navigation = useNavigation();
  const [data, setData] = useState<PasswordItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userData = useUserData();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`/password/${userData.id}/${id}`);
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    navigation.setOptions({
      title: name || "Detail",
      headerBackTitle: "Back",
    });
    fetchData();
  }, [name, navigation, id]);

  return (
    <>
      {data && !loading ? (
        <View style={{ padding: 20 }}>
          <Text style={{ fontWeight: "bold" }}>Service Name:</Text>
          <Text style={{ marginBottom: 20 }}>{data.serviceName}</Text>

          <Text style={{ fontWeight: "bold" }}>Password:</Text>
          <Text style={{ marginBottom: 20 }}>{data.password}</Text>

          <Text style={{ fontWeight: "bold" }}>Username:</Text>
          <Text style={{ marginBottom: 20 }}>{data.username}</Text>

          <Text style={{ fontWeight: "bold" }}>Email:</Text>
          <Text style={{ marginBottom: 20 }}>{data.email}</Text>

          <Text style={{ fontWeight: "bold" }}>URL:</Text>
          <Text style={{ marginBottom: 20 }}>{data.url}</Text>

          <Text style={{ fontWeight: "bold" }}>Description:</Text>
          <Text style={{ marginBottom: 20 }}>{data.description}</Text>
        </View>
      ) : loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : (
        <Text>No data found</Text>
      )}
    </>
  );
}
