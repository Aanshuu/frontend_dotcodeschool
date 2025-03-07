import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  VStack,
  HStack,
  Image,
  Flex,
  Progress,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { MdCode, MdNumbers, MdFeedback, MdTipsAndUpdates } from "react-icons/md";
import { CourseOnboardingProps, OnboardingStep } from "@/types";

const steps: OnboardingStep[] = [
  {
    title: "Welcome to the Course",
    description: "This interactive course will guide you through building real Web3 applications step by step.",
    icon: <MdCode size={24} />,
    image: "/static/images/interface.png"
  },
  {
    title: "Course Structure",
    description: "Each course is divided into lessons, and each lesson contains multiple chapters. Complete them in sequence to build your project.",
    icon: <MdNumbers size={24} />,
  },
  {
    title: "Interactive Editor",
    description: "Use the code editor to write and test your code. We'll check your solutions and provide hints when needed.",
    icon: <MdTipsAndUpdates size={24} />,
  },
  {
    title: "Feedback & Help",
    description: "Submit feedback directly through GitHub issues if you encounter problems or have suggestions for improvements.",
    icon: <MdFeedback size={24} />,
  }
];

/**
 * Course onboarding component that shows a step-by-step guide for new users
 */
const CourseOnboarding: React.FC<CourseOnboardingProps> = ({ courseTitle }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const toast = useToast();

  // Check if user has seen onboarding for this course
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const onboardingSeen = localStorage.getItem(`onboarding-${courseTitle}`);
      if (!onboardingSeen) {
        onOpen();
      } else {
        setHasSeenOnboarding(true);
      }
    }
  }, [courseTitle, onOpen]);

  // Handle next step or complete onboarding
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete
      if (typeof window !== 'undefined') {
        localStorage.setItem(`onboarding-${courseTitle}`, "true");
      }
      setHasSeenOnboarding(true);
      onClose();
      toast({
        title: "You're all set!",
        description: "Start your coding journey by clicking on the first lesson.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle skip onboarding
  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`onboarding-${courseTitle}`, "true");
    }
    setHasSeenOnboarding(true);
    onClose();
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {!hasSeenOnboarding && (
        <Modal isOpen={isOpen} onClose={handleSkip} size="xl" isCentered>
          <ModalOverlay backdropFilter="blur(5px)" />
          <ModalContent bg="gray.800" border="1px" borderColor="gray.700">
            <ModalHeader color="white">
              <HStack spacing={2}>
                {steps[currentStep].icon}
                <Text>{steps[currentStep].title}</Text>
              </HStack>
            </ModalHeader>
            <ModalBody>
              <VStack spacing={6} align="stretch">
                <Text color="gray.300" fontSize="lg">
                  {steps[currentStep].description}
                </Text>
                {steps[currentStep].image && (
                  <Box borderRadius="md" overflow="hidden" mx="auto" maxW="90%">
                    <Image 
                      src={steps[currentStep].image} 
                      alt={steps[currentStep].title}
                      w="full"
                    />
                  </Box>
                )}
                <Progress 
                  value={progressValue} 
                  size="sm" 
                  colorScheme="green" 
                  borderRadius="full" 
                  mt={4}
                />
                <Flex justify="space-between" color="gray.400" fontSize="sm">
                  <Text>Step {currentStep + 1} of {steps.length}</Text>
                  <Text>{Math.round(progressValue)}% Complete</Text>
                </Flex>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={handleSkip} mr={3}>
                Skip Tour
              </Button>
              <Button 
                rightIcon={currentStep < steps.length - 1 ? <ChevronRightIcon /> : <CheckIcon />}
                colorScheme="green"
                onClick={handleNext}
              >
                {currentStep < steps.length - 1 ? "Next" : "Get Started"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default CourseOnboarding;