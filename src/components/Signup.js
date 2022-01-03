import React, { useState } from 'react';
import {
  Box,
  InputGroup,
  Input,
  InputRightElement,
  InputLeftElement,
  Button,
  Grid,
  GridItem,
  chakra,
  useToast,
  createStandaloneToast,
  Link,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Flex
} from '@chakra-ui/react';
import * as Yup from 'yup';
import { NavLink as RouterLink } from 'react-router-dom';
import { AiOutlineUser, AiOutlineKey, AiOutlineMail } from 'react-icons/ai';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router';
import { Wrap } from './Wrap';
import User from '../context/UserContex';
import CartContext from '../context/CartContext';
import ClosePage from './ClosePage';
import axios from 'axios';

// import ErrorMessage from './ErrorMessage';
import { Formik, Field, Form, ErrorMessage, useFormik } from 'formik';

export default function Signup() {
  const [show, setShow] = useState(false);
  const context = User.useContainer();
  const cartContext = CartContext.useContainer();

  const history = useHistory();
  const standaloneToast = createStandaloneToast();

  async function mutationFn(data) {
    try {
      const user = await axios.post(
        'http://localhost:1337/auth/local/register',
        data
      );
      console.log(user.data);
      const cart = await axios.post(
        'http://localhost:1337/carts',
        {
          users_permissions_user: user.data.user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.data.jwt}`,
          },
        }
      );
      console.log(cart);
      return { user: user.data, cart: cart.data };
    } catch (e) {
      throw e;
    }
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: data => {
      standaloneToast({
        title: 'Success',
        description: 'Successfully Sign Up',
        status: 'success',
        position: 'top',
        isClosable: true,
      });
      context.login(data.user);
      console.log(data.cart);
      cartContext.setCart(data.cart);
      history.replace('/');
    },
    onError: error => {
      console.log(error);
      standaloneToast({
        title: 'Error',
        description:
          error.response?.data.message[0].messages[0].message ||
          'Sign up Error',
        status: 'error',
        position: 'top',
        isClosable: true,
      });
      mutation.reset();
    },
  });

  const handleShowClick = () => setShow(!show);
  

  return (
    <Wrap pt="200px">
      <ClosePage />
      <Box w="500px" m="0 auto">
        <Formik
          initialValues={{
            username: '',
            password: '',
            email: '',
          }}
          validationSchema={Yup.object().shape({
            username: Yup.string().required('Required'),
            password: Yup.string()
              .min(6, 'Must be 6 characters or more')
              .required('Required'),
            email: Yup.string()
              .email('Invalid email address')
              .required('Required'),
          })}
          onSubmit={async (values) => {
            await mutation.mutate(values);
          }}
        >
          {props => (
            <Form>
              <Field name="username">
                {({ field, form }) => (
                  <FormControl
                    id="username"
                    isRequired
                    mb="30px"
                    isInvalid={form.errors.username && form.touched.username}
                  >
                    <FormLabel fontWeight={600} fontSize="lg" mb={2}>
                      Username:
                    </FormLabel>
                    <Input placeholder="Enter Username" size="lg" {...field} />
                    <FormErrorMessage>{`* ${form.errors.username}`}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="password">
                {({ field, form }) => (
                  <FormControl
                    id="password"
                    isRequired
                    mb="30px"
                    isInvalid={form.errors.password && form.touched.password}
                  >
                    <FormLabel fontWeight={600} fontSize="lg" mb={2}>
                      Password:
                    </FormLabel>
                    <InputGroup size="lg">
                      <Input
                        pr="4.5rem"
                        type={show ? 'text' : 'password'}
                        placeholder="Enter password"
                        {...field}
                      />
                      <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleShowClick}>
                          {show ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{`* ${form.errors.password}`}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="email">
                {({ field, form }) => (
                  <FormControl
                    id="email"
                    isRequired
                    mb="30px"
                    isInvalid={form.errors.email && form.touched.email}
                  >
                    <FormLabel fontWeight={600} fontSize="lg" mb={2}>
                      Email:
                    </FormLabel>
                    <Input placeholder="Enter Email" size="lg" {...field} />
                    <FormErrorMessage>{`* ${form.errors.email}`}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Flex alignItems="center" justifyContent="space-between">
                <Link
                  as={RouterLink}
                  to="/signin"
                  fontSize="16px"
                  color="gray.400"
                  activeStyle={{
                    color: '#2A4365',
                  }}
                >
                  Already has a account? Sign in!
                </Link>
                <Button
                  colorScheme="teal"
                  isLoading={mutation.isLoading}
                  type="submit"
                >
                  Submit
                </Button>
              </Flex>
            </Form>
          )}
        </Formik>
      </Box>
    </Wrap>
  );
}
