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
import { Header, Icon, Input, Button, ListItem } from "@rneui/themed";

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
      <Header
        centerComponent={{
          text: "SHOPPING LIST",
          style: {
            color: "white",
            marginTop: "20%",
            fontWeight: 700,
            fontSize: 20,
          },
        }}
      />
      <Input
        label="Product"
        placeholder="Product"
        value={product}
        onChangeText={(text) => {
          handleProductInputChange(text);
        }}
      />
      <Input
        label="Amount"
        placeholder="Amount"
        value={amount}
        onChangeText={(text) => {
          handleAmountInputChange(text);
        }}
      />
      <Button raised icon={{ name: "save" }} onPress={save} title="SAVE" />
      <View
        style={{
          flex: 1,
          marginTop: 30,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 25 }}>Shopping List</Text>
        <FlatList
          data={listItems}
          renderItem={({ item }) => (
            <ListItem bottomDivider>
              <ListItem.Content
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <ListItem.Title>{item.product}</ListItem.Title>
                  <ListItem.Subtitle>{item.amount}</ListItem.Subtitle>
                </View>
                <View>
                  <Button
                    icon={{ name: "delete", color: "red" }}
                    onPress={() => deleteItem(item.id)}
                    buttonStyle={{ backgroundColor: "transparent" }}
                  />
                </View>
              </ListItem.Content>
            </ListItem>
          )}
          keyExtractor={(item, index) => index.toString()}
          style={{ width: "100%" }}
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
