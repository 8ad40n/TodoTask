"use client";
import db from "@/firebase/firestore";
import { AuthContext } from "@/providers/AuthProvider";
import { ITodo } from "@/types";
import {
    CalendarOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    ConfigProvider,
    DatePicker,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Select,
    Space,
    Spin,
    Tag,
    theme,
    Typography,
} from "antd";
import dayjs from "dayjs";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { useCallback, useContext, useEffect, useState } from "react";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { defaultAlgorithm } = theme;

const Todo = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<ITodo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);

  const fetchTodos = useCallback(async () => {
    try {
      if (!user || !user.uid) {
        setTodos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const todosRef = collection(db, "todos");
      const q = query(
        todosRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const todoList: ITodo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        todoList.push({
          id: doc.id,
          title: data.title,
          description: data.description || "",
          dueDate: dayjs(data.dueDate.toDate()).format("YYYY-MM-DD"),
          status: data.status,
          createdAt: data.createdAt.toDate().toISOString(),
          userId: data.userId,
        });
      });

      setTodos(todoList);
    } catch (error) {
      console.error("Error fetching todos:", error);
      messageApi.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [user, messageApi]);

  useEffect(() => {
    fetchTodos();
  }, [user, fetchTodos]);

  const filteredTodos = todos
    .filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === "all" || todo.status === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (a.status === "pending" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "pending") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const openNewTodoModal = () => {
    form.resetFields();
    setIsEditMode(false);
    setCurrentTodo(null);
    showModal();
  };

  const openEditTodoModal = (todo: ITodo) => {
    setIsEditMode(true);
    setCurrentTodo(todo);
    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      dueDate: dayjs(todo.dueDate),
    });
    showModal();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const addTodo = async (
    title: string,
    description: string,
    dueDate: dayjs.Dayjs
  ) => {
    try {
      if (!user || !user.uid) {
        messageApi.error("You must be logged in to add tasks");
        return;
      }

      setLoading(true);
      const todosRef = collection(db, "todos");

      const newTodo = {
        title,
        description,
        dueDate: Timestamp.fromDate(dueDate.toDate()),
        status: "pending",
        createdAt: Timestamp.fromDate(new Date()),
        userId: user.uid, 
      };

      await addDoc(todosRef, newTodo);

      messageApi.success("Todo added successfully");
      fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
      messageApi.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (
    id: string,
    title: string,
    description: string,
    dueDate: dayjs.Dayjs
  ) => {
    try {
      if (!user || !user.uid) {
        messageApi.error("You must be logged in to update tasks");
        return;
      }

      setLoading(true);
      const todoRef = doc(db, "todos", id);

      await updateDoc(todoRef, {
        title,
        description,
        dueDate: Timestamp.fromDate(dueDate.toDate()),
      });

      messageApi.success("Todo updated successfully");
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
      messageApi.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (values: {
    title: string;
    description: string;
    dueDate: dayjs.Dayjs;
  }) => {
    const { title, description, dueDate } = values;

    if (isEditMode && currentTodo) {
      updateTodo(currentTodo.id, title, description, dueDate);
    } else {
      addTodo(title, description, dueDate);
    }

    setIsModalOpen(false);
  };

  const toggleTodoStatus = async (id: string, currentStatus: string) => {
    try {
      if (!user || !user.uid) {
        messageApi.error("You must be logged in to update task status");
        return;
      }

      setLoading(true);
      const todoRef = doc(db, "todos", id);
      const newStatus = currentStatus === "pending" ? "completed" : "pending";

      await updateDoc(todoRef, {
        status: newStatus,
      });

      messageApi.success(`Task marked as ${newStatus}`);
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo status:", error);
      messageApi.error("Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      if (!user || !user.uid) {
        messageApi.error("You must be logged in to delete tasks");
        return;
      }

      setLoading(true);
      const todoRef = doc(db, "todos", id);

      await deleteDoc(todoRef);

      messageApi.success("Todo deleted successfully");
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
      messageApi.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const lightTheme = {
    token: {
      colorPrimary: "#6d28d9",
      colorSuccess: "#10b981",
      colorWarning: "#f59e0b",
      colorError: "#ef4444",
      colorLink: "#4f46e5",
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
    algorithm: defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={lightTheme}>
      <div className="min-h-screen bg-gray-100">
        {contextHolder}
        <div className="p-4 sm:p-6 md:p-8 mx-auto">
          <div className="text-center mb-6">
            <div className="primary-color font-bold">
              {user
                ? `${user.displayName || "Your"}'s Task Board`
                : "Task Board"}
            </div>
            <Paragraph className="text-indigo-600 max-w-xl mx-auto text-sm sm:text-base">
              Keep track of your tasks, deadlines, and progress all in one place
              to stay organized and productive
            </Paragraph>
          </div>

          {!user ? (
            <Card className="rounded-lg text-center p-6 shadow-lg border-indigo-100">
              <Empty
                description={
                  <span className="text-gray-500 text-sm sm:text-base">
                    Please sign in to view and manage your tasks
                  </span>
                }
              />
            </Card>
          ) : (
            <>
              <div className="mb-3 bg-[#ffffff] px-4 py-3 rounded-lg border-indigo-100 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                  <Input
                    placeholder="Search tasks..."
                    prefix={<SearchOutlined className="text-indigo-400" />}
                    className="max-w-xs border-indigo-200 hover:border-indigo-400 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="middle"
                  />
                  <Space wrap>
                    <Select
                      defaultValue="all"
                      className="min-w-[120px]"
                      onChange={(value) =>
                        setFilter(value as "all" | "pending" | "completed")
                      }
                      size="middle"
                    >
                      <Option value="all">All Tasks</Option>
                      <Option value="pending">Pending</Option>
                      <Option value="completed">Completed</Option>
                    </Select>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openNewTodoModal}
                      size="middle"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add Task
                    </Button>
                  </Space>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Spin size="large" />
                </div>
              ) : filteredTodos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredTodos.map((todo) => (
                    <Card
                      key={todo.id}
                      hoverable
                      className={`rounded-lg transition-all duration-300 hover:shadow-lg border-l-4 ${
                        todo.status === "completed"
                          ? "border-l-green-500"
                          : dayjs(todo.dueDate).isBefore(dayjs(), "day")
                          ? "border-l-red-500"
                          : "border-l-yellow-500"
                      }`}
                      actions={[
                        <Button
                          key="toggle"
                          type="text"
                          className={`${
                            todo.status === "pending"
                              ? "text-green-600"
                              : "text-amber-600"
                          } hover:text-indigo-600`}
                          icon={
                            todo.status === "pending" ? (
                              <CheckOutlined />
                            ) : (
                              <ClockCircleOutlined />
                            )
                          }
                          onClick={() => toggleTodoStatus(todo.id, todo.status)}
                        >
                          {todo.status === "pending" ? "Complete" : "Reopen"}
                        </Button>,
                        <Button
                          key="edit"
                          type="text"
                          className="text-blue-600 hover:text-indigo-600"
                          icon={<EditOutlined />}
                          onClick={() => openEditTodoModal(todo)}
                        >
                          Edit
                        </Button>,
                        <Button
                          key="delete"
                          type="text"
                          className="text-gray-500 hover:text-red-500"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => deleteTodo(todo.id)}
                        >
                          Delete
                        </Button>,
                      ]}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between mb-2 flex-wrap gap-2">
                            <Title
                              level={5}
                              className="m-0"
                              style={{
                                color:
                                  todo.status === "completed"
                                    ? "#6d28d9"
                                    : "#6d28d9",
                                textDecoration:
                                  todo.status === "completed"
                                    ? "line-through"
                                    : "none",
                              }}
                            >
                              {todo.title}
                            </Title>
                            <Tag
                              color={
                                todo.status === "pending"
                                  ? "warning"
                                  : "success"
                              }
                              className="rounded-full flex justify-center items-center"
                            >
                              {todo.status === "pending" ? (
                                <>
                                  <ClockCircleOutlined /> Pending
                                </>
                              ) : (
                                <>
                                  <CheckOutlined /> Completed
                                </>
                              )}
                            </Tag>
                          </div>
                          {todo.description && (
                            <Paragraph
                              className={`mb-2 ${
                                todo.status === "completed"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              } text-sm`}
                            >
                              {todo.description}
                            </Paragraph>
                          )}
                          <Text
                            className={`${
                              dayjs(todo.dueDate).isBefore(dayjs(), "day") &&
                              todo.status === "pending"
                                ? "text-red-500 font-medium"
                                : "text-gray-500"
                            } text-sm`}
                          >
                            <CalendarOutlined className="mr-1" />
                            Due: {dayjs(todo.dueDate).format("MMM D, YYYY")}
                            {dayjs(todo.dueDate).isBefore(dayjs(), "day") &&
                              todo.status === "pending" &&
                              " (Overdue)"}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-lg text-center p-6 shadow-lg border-indigo-100">
                  <Empty
                    description={
                      <span className="text-gray-500 text-sm sm:text-base">
                        {searchTerm
                          ? "No tasks match your search"
                          : "You don't have any tasks yet"}
                      </span>
                    }
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openNewTodoModal}
                      size="middle"
                      className="mt-6 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add your first task
                    </Button>
                  </Empty>
                </Card>
              )}
            </>
          )}
        </div>

        <Modal
          title={
            <div className="flex items-center gap-2 text-indigo-700">
              {isEditMode ? <EditOutlined /> : <PlusOutlined />}
              <span>{isEditMode ? "Edit Task" : "Add New Task"}</span>
            </div>
          }
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="task-form"
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please input the title!" }]}
            >
              <Input
                placeholder="Enter task title"
                size="middle"
                className="border-indigo-200 hover:border-indigo-400 focus:border-indigo-500"
              />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea
                placeholder="Enter task description (optional)"
                rows={3}
                className="border-indigo-200 hover:border-indigo-400 focus:border-indigo-500"
              />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true, message: "Please select due date!" }]}
            >
              <DatePicker
                className="w-full border-indigo-200 hover:border-indigo-400 focus:border-indigo-500"
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  return current && current < dayjs().startOf("day");
                }}
                size="middle"
                value={currentTodo ? dayjs(currentTodo.dueDate) : null} 
              />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={handleCancel} size="middle">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isEditMode ? "Update Task" : "Add Task"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Todo;
