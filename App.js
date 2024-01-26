import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";

export default function App() {
  const [listItems, setListItems] = useState([]);
  const [product, setProduct] = useState();
  const [amount, setAmount] = useState();

  const db = SQLite.openDatabase("shoppingList.db");

  useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "create table if not exists shoppingList (id integer primary key not null, product text, amount text);"
        );
      },
      () => console.error("Error when creating DB"),
      updateList
    );
  }, []);

  const handleProductInputChange = (text) => {
    setProduct(text);
  };

  const handleAmountInputChange = (text) => {
    setAmount(text);
  };

  const save = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "insert into shoppingList (product, amount) values (?, ?);",
          [product.trim(), amount.trim()]
        );
      },
      null,
      updateList
    );

    setProduct("");
    setAmount("");
    Keyboard.dismiss();
  };

  const updateList = () => {
    db.transaction(
      (tx) => {
        tx.executeSql("select * from shoppingList;", [], (_, { rows }) =>
          setListItems(rows._array)
        );
      },
      null,
      null
    );
  };

  const deleteItem = (id) => {
    db.transaction(
      (tx) => tx.executeSql("delete from shoppingList where id = ?;", [id]),
      null,
      updateList
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={{
          marginTop: "10%",
          borderWidth: 2,
          borderColor: "black",
          width: "60%",
          height: 40,
          fontSize: 18,
        }}
        placeholder="Product"
        value={product}
        onChangeText={(text) => {
          handleProductInputChange(text);
        }}
      />
      <TextInput
        style={{
          marginTop: "2%",
          borderWidth: 2,
          borderColor: "black",
          width: "60%",
          height: 40,
          fontSize: 18,
        }}
        placeholder="Amount"
        value={amount}
        onChangeText={(text) => {
          handleAmountInputChange(text);
        }}
      />
      <Pressable
        style={{
          backgroundColor: "blue",
          padding: 10,
          marginTop: 10,
        }}
        onPress={save}
      >
        <Text style={{ color: "white" }}>Save</Text>
      </Pressable>
      <View
        style={{
          flex: 1,
          marginTop: 30,
        }}
      >
        <Text style={{ fontSize: 25 }}>Shopping List</Text>
        <FlatList
          data={listItems}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                marginTop: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>{item.product + " " + item.amount} </Text>
              <Pressable
                style={{ backgroundColor: "green", padding: 5 }}
                onPress={() => deleteItem(item.id)}
              >
                <Text
                  style={{
                    color: "white",
                  }}
                >
                  Bought
                </Text>
              </Pressable>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          style={{
            maxHeight: 300,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
