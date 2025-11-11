import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { cloneElement } from "react";

// Takes in a single child component and applys a confirmation modal upon press.
const ConfirmationModal = ({
  children,
  title = "Are You Sure?",
  message = "Are you sure you want to do this ?",
  confirmText = "Confirm",
  closeText = "Cancel",
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Clone original click handler
  const origHandler = children.props.onClick;

  // Clone the child and overwrite its onclick to open the modal instead
  const clone = cloneElement(children, { onClick: onOpen });

  // On modal confirm close the modal then handle original handler
  const handleConfirm = () => {
    onClose();
    origHandler();
  }

  return (
    <div>
      {clone}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{message}</ModalBody>
          <ModalFooter>
            <Button variant={'ghost'} mr={3} onClick={onClose}>
              {closeText}
            </Button>
            <Button variant="outline" colorScheme='red' onClick={handleConfirm}>{confirmText}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ConfirmationModal;
