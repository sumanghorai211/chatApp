const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");
const {
  ConversationModel,
  MessageModel,
} = require("../models/ConversationModel");
const getConversation = require("../helpers/getConversation");

const app = express();

/***socket connection */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://endearing-gumdrop-ad1ace.netlify.app",
      "http://localhost:3000",
    ],
    credentials: true,
  },
});

/***
 * socket running at http://localhost:8080/
 */

//online user
const onlineUser = new Set();

io.on("connection", async (socket) => {
  console.log("Connected User: ", socket.id);

  try {
    const token = socket.handshake.auth.token;

    // Validate token and get current user details
    const user = await getUserDetailsFromToken(token);
    if (!user) {
      console.error("Invalid token. User not authenticated.");
      socket.disconnect();
      return;
    }

    // Create a room for the user and add them to the online user list
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());

    io.emit("onlineUser", Array.from(onlineUser));

    // Additional socket event listeners
  } catch (error) {
    console.error("Error during socket connection:", error);
    socket.disconnect();
  }

  socket.on("message-page", async (userId) => {
    try {
      const userDetails = await UserModel.findById(userId).select("-password");

      const payload = {
        _id: userDetails._id,
        name: userDetails.name,
        email: userDetails.email,
        profile_pic: userDetails.profile_pic,
        online: onlineUser.has(userId),
      };
      socket.emit("message-user", payload);

      // Get previous messages
      const getConversationMessage = await ConversationModel.findOne({
        $or: [
          { sender: user._id, receiver: userId },
          { sender: userId, receiver: user._id },
        ],
      })
        .populate("messages")
        .sort({ updatedAt: -1 });

      socket.emit("message", getConversationMessage?.messages || []);
    } catch (error) {
      console.error("Error fetching message page data:", error);
    }
  });

  // New message handler
  socket.on("new message", async (data) => {
    try {
      let conversation = await ConversationModel.findOne({
        $or: [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender },
        ],
      });

      // Create a new conversation if it doesn't exist
      if (!conversation) {
        const createConversation = await ConversationModel({
          sender: data.sender,
          receiver: data.receiver,
        });
        conversation = await createConversation.save();
      }

      const message = new MessageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        msgByUserId: data.msgByUserId,
      });
      const saveMessage = await message.save();

      await ConversationModel.updateOne(
        { _id: conversation._id },
        {
          $push: { messages: saveMessage._id },
        }
      );

      const getConversationMessage = await ConversationModel.findOne({
        $or: [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender },
        ],
      })
        .populate("messages")
        .sort({ updatedAt: -1 });

      io.to(data.sender).emit(
        "message",
        getConversationMessage?.messages || []
      );
      io.to(data.receiver).emit(
        "message",
        getConversationMessage?.messages || []
      );

      // Send updated conversation list
      const conversationSender = await getConversation(data.sender);
      const conversationReceiver = await getConversation(data.receiver);

      io.to(data.sender).emit("conversation", conversationSender);
      io.to(data.receiver).emit("conversation", conversationReceiver);
    } catch (error) {
      console.error("Error handling new message:", error);
    }
  });

  socket.on("sidebar", async (currentUserId) => {
    try {
      const conversation = await getConversation(currentUserId);
      socket.emit("conversation", conversation);
    } catch (error) {
      console.error("Error handling sidebar data:", error);
    }
  });

  socket.on("seen", async (msgByUserId) => {
    try {
      let conversation = await ConversationModel.findOne({
        $or: [
          { sender: user._id, receiver: msgByUserId },
          { sender: msgByUserId, receiver: user._id },
        ],
      });

      const conversationMessageId = conversation?.messages || [];

      await MessageModel.updateMany(
        { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
        { $set: { seen: true } }
      );

      // Send updated conversation list
      const conversationSender = await getConversation(user._id.toString());
      const conversationReceiver = await getConversation(msgByUserId);

      io.to(user._id.toString()).emit("conversation", conversationSender);
      io.to(msgByUserId).emit("conversation", conversationReceiver);
    } catch (error) {
      console.error("Error handling seen event:", error);
    }
  });

  socket.on("disconnect", () => {
    try {
      onlineUser.delete(user._id.toString());
      console.log("Disconnected User: ", socket.id);
      io.emit("onlineUser", Array.from(onlineUser));
    } catch (error) {
      console.error("Error during disconnection:", error);
    }
  });
});

module.exports = {
  app,
  server,
};
